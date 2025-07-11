import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';

import assert from 'assert';

import { splitIntoLines } from './textUtils.mjs';

type NodeParsedResults = ReturnType<typeof parseArgs>;
type ParsedToken = Exclude<NodeParsedResults['tokens'], undefined>[number];

const defaultWidth = 80;

export class Command<ArgDefs extends ArgsDefinitions = ArgsDefinitions, OptDefs extends OptionDefinitions = OptionDefinitions> {
    #arguments: Argument[] = [];
    #options: Option[] = [];
    #handler?: HandlerFn<ArgDefs, OptDefs>;
    constructor(
        readonly name: string,
        readonly description: string,
        args: ArgDefs,
        options: OptDefs,
        handler?: HandlerFn<ArgDefs, OptDefs>,
    ) {
        for (const [key, def] of Object.entries(args)) {
            this.#arguments.push(new Argument(key, def));
        }
        for (const [key, def] of Object.entries(options)) {
            this.#options.push(new Option(key, def));
        }
        const found = this.#options.find((o) => o.name == 'help');
        if (!found) this.#options.push(new Option('help', { type: 'boolean', description: 'Show help', short: 'h' }));
        this.#handler = handler;
    }

    handler(fn: HandlerFn<ArgDefs, OptDefs>) {
        this.#handler = fn;
        return this;
    }

    handles(argv: string[]): boolean {
        return argv[0] == this.name;
    }

    parse(argv: string[]): ParsedResults<ArgDefs, OptDefs> {
        const tokenizer = createTokenizer(this);
        assert(argv[0] == this.name, `Command name mismatch: ${argv[0]} != ${this.name}`);
        const tokens = tokenizer(argv.slice(1));

        // console.log('tokens: %o', tokens);

        const positionals: string[] = [];
        const args = { _: positionals } as ArgDefsToArgs<ArgDefs>;
        const shadowArgs: Record<string, string[] | string | undefined> = args;
        const options = {} as OptDefsToOpts<OptDefs>;
        const shadowOpts: Record<string, OptionTypes | OptionTypes[] | undefined> = options;

        const argDefs = this.arguments;
        let i = 0;
        for (const token of tokens) {
            switch (token.kind) {
                case 'option':
                    {
                        let invert = false;
                        let opt = this.#options.find((o) => o.name == token.name);
                        if (!opt) {
                            if (token.name.startsWith('no-')) {
                                opt = this.#options.find((o) => o.name == token.name.slice(3));
                                invert = true;
                            }
                        }
                        if (!opt) {
                            throw new Error(`Unknown option: ${token.name}`);
                        }
                        const name = opt.name;
                        let value = castValueToType(token.value, opt.baseType);
                        if (invert && typeof value == 'boolean') {
                            value = !value;
                        }
                        shadowOpts[name] = opt.multiple ? append(options[name], value) : value;
                    }
                    break;
                case 'positional':
                    {
                        positionals.push(token.value);
                        if (i >= argDefs.length) {
                            throw new Error(`Unexpected argument: ${token.value}`);
                        }
                        const arg = argDefs[i];
                        const value = token.value;
                        shadowArgs[arg.name] = arg.multiple ? append(args[arg.name], value) : value;
                        i += arg.multiple ? 0 : 1;
                    }
                    break;
                case 'option-terminator':
                    break;
            }
        }

        return { args, options, argv };
    }

    async exec(argv: string[]) {
        assert(this.#handler, 'handler not set');
        assert(argv[0] == this.name);
        const parsedArgs = this.parse(argv);
        await this.#handler(parsedArgs);
    }

    getArgString() {
        return this.#arguments.join(' ');
    }

    get options(): Option[] {
        return this.#options;
    }

    get arguments(): Argument[] {
        return this.#arguments;
    }
}

export class Application {
    #commands = new Map<string, Command>();
    public displayWidth = defaultWidth;

    constructor(
        public name: string,
        public description = '',
        public usage = '',
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addCommand(...commands: Command<any, any>[]) {
        for (const cmd of commands) {
            this.#commands.set(cmd.name, cmd as Command);
        }
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addCommands(commands: Command<any, any>[]) {
        return this.addCommand(...commands);
    }

    getHelp(command?: string, width?: number): string {
        const cmd = command ? this.#commands.get(command) : undefined;
        if (command && !cmd) throw new Error(`Unknown command: ${command}`);
        width = width || this.displayWidth;
        return cmd ? this.#formatCommandHelp(cmd, width) : this.#formatHelp(width);
    }

    getApplicationHeader(width = this.displayWidth) {
        return this.#formatApplicationHeader(width);
    }

    #formatHelp(width: number): string {
        const lines = [];
        lines.push(this.#formatApplicationHeader(width));
        const commands = [...this.#commands.values()].sort((a, b) => a.name.localeCompare(b.name));
        const cmdPrefix = '  ';
        const cols = commands
            .map((cmd) => commandHelpLine(cmd))
            .map((line) => [cmdPrefix + line.cmd + ' ' + line.args, line.description.trim()] as const);
        lines.push('Commands:');
        lines.push(formatTwoColumns(cols, width, '  '));
        return lines.join('\n');
    }

    #formatCommandHelp(cmd: Command, width: number): string {
        const lines = [];
        const options = cmd.options.length ? ' [options]' : '';
        lines.push(`Usage: ${cmd.name}${options} ${cmd.getArgString()}`);
        lines.push('', ...splitIntoLines(cmd.description, width));
        const indent = '  ';
        const argumentColumns = cmd.arguments.map((arg) => [indent + arg.toString(), arg.description.trim()] as const);
        if (argumentColumns.length) {
            lines.push('');
            lines.push('Arguments:');
            lines.push(formatTwoColumns(argumentColumns, width, '  '));
        }
        const optionColumns = cmd.options.map((opt) => [indent + opt.toString(), opt.description.trim()] as const);
        if (optionColumns.length) {
            lines.push('');
            lines.push('Options:');
            lines.push(formatTwoColumns(optionColumns, width, '  '));
        }
        return lines.join('\n');
    }

    #formatApplicationHeader(width: number) {
        const lines = [];
        lines.push(this.name, '');
        if (this.description) {
            lines.push(...splitIntoLines(this.description, width), '');
        }
        if (this.usage) {
            lines.push('Usage:', ...splitIntoLines(this.usage, width), '');
        }
        return lines.join('\n');
    }

    getCommand(cmdName: string): Command | undefined {
        return this.#commands.get(cmdName);
    }

    parseArgs(args: string[]) {
        const cmdName = args[0];
        const cmd = this.getCommand(cmdName);
        if (!cmd) {
            throw new Error(`Unknown command: ${cmdName}`);
        }
        return cmd.parse(args);
    }

    async exec(argv: string[], log: typeof console.log) {
        const cmdName = argv[0];
        const cmd = this.getCommand(cmdName);
        if (!cmd) {
            throw new Error(`Unknown command: ${cmdName}`);
        }
        const parsedArgs = cmd.parse(argv);
        if (parsedArgs.options.help) {
            log(this.#formatCommandHelp(cmd, this.displayWidth));
            return;
        }
        await cmd.exec(argv);
    }

    getCommandNames() {
        return [...this.#commands.keys()];
    }
}

function commandHelpLine(cmd: Command) {
    const argLine = cmd.getArgString();
    return { cmd: cmd.name, args: argLine, description: cmd.description };
}

class Argument<K extends string = string, V extends ArgTypeNames = ArgTypeNames> implements Required<ArgDef<V>> {
    readonly multiple: boolean;
    readonly description: string;
    readonly type: V;
    readonly required: boolean;

    constructor(
        readonly name: K,
        def: ArgDef<V>,
    ) {
        this.description = def.description;
        this.type = def.type;
        this.required = def.required || false;
        this.multiple = this.type.endsWith('[]');
    }
    toString() {
        const variadic = this.multiple ? '...' : '';
        const name = `${this.name}${variadic}`;
        return this.required ? `<${name}>` : `[${name}]`;
    }
}

class Option<K extends string = string, V extends OptionTypeNames = OptionTypeNames> implements Required<OptionDef<V>> {
    readonly multiple: boolean;
    readonly description: string;
    readonly type: V;
    readonly short: string;
    readonly param: string;
    readonly required: boolean;
    readonly baseType: OptionTypeBaseNames;
    readonly variadic: boolean;

    constructor(
        readonly name: K,
        def: OptionDef<V>,
    ) {
        this.description = def.description;
        this.type = def.type;
        this.short = def.short || '';
        this.param = def.param || this.name;
        this.required = def.required ?? true;
        this.baseType = typeNameToBaseTypeName(this.type);
        this.multiple = this.type.endsWith('[]');
        this.variadic = def.variadic || false;

        if (this.variadic && !this.multiple) {
            throw new Error('variadic option must be multiple');
        }
    }

    toString() {
        const short = this.short ? `-${this.short}, ` : '';
        const paramName = this.param || this.name;
        const suffix = this.variadic ? '...' : '';

        const paramWithSuffix = ['boolean', 'boolean[]'].includes(this.type) ? '' : `${paramName}${suffix}`;
        const param = paramWithSuffix && (this.required ? ` <${paramWithSuffix}>` : ` [${paramWithSuffix}]`);

        return `${short}--${this.name}${param}`;
    }
}

interface OptionDef<T extends OptionTypeNames> {
    /**
     * The description of the option
     */
    readonly description: string;
    /**
     * The type of the option parameter
     */
    readonly type: T;
    /**
     * The short name for the option
     * Must be a single character.
     */
    readonly short?: string | undefined;
    /**
     * The name of the parameter for the option
     *
     * Defaults to the option name
     */
    readonly param?: string | undefined;
    /**
     * Indicates if the option parameter is optional or required
     * @default true
     */
    readonly required?: boolean | undefined;

    readonly variadic?: boolean | undefined;
}

interface ArgDef<T extends ArgTypeNames> {
    /**
     * The description of the option
     */
    readonly description: string;
    /**
     * The type of the option parameter
     */
    readonly type: T;
    /**
     * Indicates if the option parameter is optional or required
     *
     * Note: this only impacts non-boolean values.
     * @default false
     */
    readonly required?: boolean | undefined;
}

interface OptionTypeDefBase {
    boolean: boolean;
    string: string;
    number: number;
}

interface OptionTypeDefs extends OptionTypeDefBase {
    'boolean[]': boolean[];
    'string[]': string[];
    'number[]': number[];
}

export type OptionTypeBaseNames = keyof OptionTypeDefBase;
export type OptionTypeNames = keyof OptionTypeDefs;

type ArgTypeDefs = Pick<OptionTypeDefs, 'string' | 'string[]'>;

export type ArgTypeNames = keyof ArgTypeDefs;
export type ArgTypes = ArgTypeDefs[ArgTypeNames];

export type TypeNameToType<T extends OptionTypeNames> = T extends 'boolean'
    ? boolean
    : T extends 'string'
      ? string
      : T extends 'number'
        ? number
        : T extends 'boolean[]'
          ? boolean[]
          : T extends 'string[]'
            ? string[]
            : T extends 'number[]'
              ? number[]
              : never;

export type DefToType<T extends Record<string, OptionTypeNames>> = {
    [K in keyof T]: TypeNameToType<T[K]>;
};

type SpecificOptionTypes<K extends keyof OptionTypeDefs> = OptionTypeDefs[K];
type OptionTypes = SpecificOptionTypes<keyof OptionTypeDefs>;

export type TypeToTypeName<T> = T extends boolean
    ? 'boolean'
    : T extends string
      ? 'string'
      : T extends number
        ? 'number'
        : T extends boolean[]
          ? 'boolean[]'
          : T extends string[]
            ? 'string[]'
            : T extends number[]
              ? 'number[]'
              : never;

export type ArgsDefinitions = Record<string, ArgDef<ArgTypeNames>>;

type ArgInlineDef<N extends string, T extends ArgTypeNames> = Record<N, ArgDef<T>>;

/**
 * Define an argument
 * @param name - The name of the argument
 * @param type - The type of the argument `string` | `string[]`
 * @param description - The description of the argument
 * @param required - Indicates if the argument is required or optional
 * @returns An object that can be used to define arguments inline
 */
export function defArg<N extends string, T extends ArgTypeNames>(
    name: N,
    type: T,
    description: string,
    required?: boolean,
): ArgInlineDef<N, T> {
    return { [name]: { type, description, required } } as ArgInlineDef<N, T>;
}

type OptInlineDef<N extends string, T extends OptionTypeNames> = Record<N, OptionDef<T>>;

/**
 * Define an option
 * @param name - The name of the argument
 * @param type - The type of the argument `string` | `string[]`
 * @param description - The description of the argument
 * @param required - Indicates if the argument is required or optional
 * @returns An object that can be used to define arguments inline
 */
export function defOpt<N extends string, T extends OptionTypeNames>(
    name: N,
    type: T,
    description: string,
    short: string | undefined,
): OptInlineDef<N, T> {
    return { [name]: { type, description, short: short ? short : undefined } } as OptInlineDef<N, T>;
}

type ArgDefsToArgs<T extends ArgsDefinitions> = {
    [k in keyof T]?: TypeNameToType<T[k]['type']>;
} & { _: string[] };

export type OptionDefinitions = Record<string, OptionDef<OptionTypeNames>>;

type OptDefsToOpts<T extends OptionDefinitions> = {
    [k in keyof T]: TypeNameToType<T[k]['type']>;
};

interface ParsedResults<ArgDefs extends ArgsDefinitions, OptDefs extends OptionDefinitions> {
    args: ArgDefsToArgs<ArgDefs>;
    options: OptDefsToOpts<OptDefs>;
    argv: string[];
}

type HandlerFn<ArgDefs extends ArgsDefinitions, OptDefs extends OptionDefinitions> = (
    parsedArgs: ParsedResults<ArgDefs, OptDefs>,
) => Promise<void> | void;

function formatTwoColumns(columns: readonly (readonly [string, string])[], width: number, sep = '  ') {
    const lines = [];

    const col1Width = Math.max(...columns.map(([left]) => left.length), 0);

    for (const [left, right] of columns) {
        const rightLines = splitIntoLines(right, width - col1Width - sep.length);
        lines.push(`${left.padEnd(col1Width)}${sep}${rightLines[0] || ''}`);
        for (const line of rightLines.slice(1)) {
            lines.push(' '.repeat(col1Width) + sep + line);
        }
    }
    return lines.join('\n');
}

function typeNameToBaseTypeName(type: 'boolean' | 'boolean[]'): 'boolean';
function typeNameToBaseTypeName(type: 'number' | 'number[]'): 'number';
function typeNameToBaseTypeName(type: 'string' | 'string[]'): 'string';
function typeNameToBaseTypeName(type: OptionTypeNames): OptionTypeBaseNames;
function typeNameToBaseTypeName(type: OptionTypeNames): OptionTypeBaseNames {
    return type.replace('[]', '') as OptionTypeBaseNames;
}

function append<T>(...values: (T | T[] | undefined)[]): T[] {
    return values.flatMap((a) => a).filter((v): v is T => v !== undefined);
}

function createTokenizer<ArgDefs extends ArgsDefinitions = ArgsDefinitions, OptDefs extends OptionDefinitions = OptionDefinitions>(
    command: Command<ArgDefs, OptDefs>,
): (args: string[]) => ParsedToken[] {
    const options: ParseArgsConfig['options'] = {};

    for (const opt of command.options) {
        options[opt.name] = {
            type: opt.baseType !== 'boolean' ? 'string' : 'boolean',
            multiple: opt.multiple,
        };
        if (opt.short) {
            options[opt.name].short = opt.short;
        }
    }

    return (args: string[]) => {
        const result = parseArgs({ args, options, allowPositionals: true, tokens: true, strict: false });
        const tokens = result.tokens || [];
        return tokens;
    };
}

export function castValueToType<T extends OptionTypeBaseNames>(value: unknown, type: T): SpecificOptionTypes<T>;
export function castValueToType(value: unknown, type: OptionTypeBaseNames): SpecificOptionTypes<OptionTypeBaseNames>;
export function castValueToType(value: unknown, type: OptionTypeBaseNames): SpecificOptionTypes<OptionTypeBaseNames> {
    switch (type) {
        case 'boolean':
            return toBoolean(value ?? true);
        case 'number':
            return toNumber(value);
        case 'string':
            return typeof value == 'string' ? value : `${value}`;
    }
}

export function toBoolean(value: unknown): boolean;
export function toBoolean(value: unknown | undefined): boolean | undefined;
export function toBoolean(value: unknown | undefined): boolean | undefined {
    if (value === undefined) return undefined;
    if (typeof value == 'boolean') return value;
    if (typeof value == 'number') return !!value;
    if (typeof value == 'string') {
        const v = value.toLowerCase().trim();
        if (['true', 't', 'yes', 'y', '1', 'ok'].includes(v)) return true;
        if (['false', 'f', 'no', 'n', '0', ''].includes(v)) return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    throw new Error(`Invalid boolean value: ${value}`);
}

export function toNumber(value: unknown): number {
    const num = Number(value);
    if (!Number.isNaN(num)) return num;
    throw new Error(`Invalid number value: ${value}`);
}
