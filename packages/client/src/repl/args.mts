import assert from 'assert';

import { splitIntoLines } from './textUtils.mjs';

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
        this.#handler = handler;
    }

    handler(fn: HandlerFn<ArgDefs, OptDefs>) {
        this.#handler = fn;
        return this;
    }

    handles(argv: string[]): boolean {
        return argv[0] == this.name;
    }

    async parse(argv: string[]) {
        assert(this.#handler, 'handler not set');
        assert(argv[0] == this.name);
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
        public description: string,
        public usage: string = '',
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addCommand(...commands: Command<any, any>[]) {
        for (const cmd of commands) {
            this.#commands.set(cmd.name, cmd);
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
        const commands = [...this.#commands.values()];
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
        const argumentColumns = cmd.arguments.map((arg) => [indent + arg, arg.description.trim()] as const);
        if (argumentColumns.length) {
            lines.push('');
            lines.push('Arguments:');
            lines.push(formatTwoColumns(argumentColumns, width, '  '));
        }
        const optionColumns = cmd.options.map((opt) => [indent + opt, opt.description.trim()] as const);
        if (optionColumns.length) {
            lines.push('');
            lines.push('Options:');
            lines.push(formatTwoColumns(optionColumns, width, '  '));
        }
        return lines.join('\n');
    }

    #formatApplicationHeader(width: number) {
        const lines = [];
        lines.push(this.name, '', ...splitIntoLines(this.description, width), '');
        if (this.usage) {
            lines.push('', 'Usage:', '', ...splitIntoLines(this.usage, width), '');
        }
        return lines.join('\n');
    }
}

function commandHelpLine(cmd: Command) {
    const argLine = cmd.getArgString();
    return { cmd: cmd.name, args: argLine, description: cmd.description };
}

class Argument<K extends string = string, V extends TypeNames = TypeNames> implements Required<ArgDef<V>> {
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

class Option<K extends string = string, V extends TypeNames = TypeNames> implements Required<OptionDef<V>> {
    readonly multiple: boolean;
    readonly description: string;
    readonly type: V;
    readonly short: string;
    readonly param: string;
    readonly required: boolean;

    constructor(
        readonly name: K,
        def: OptionDef<V>,
    ) {
        this.description = def.description;
        this.type = def.type;
        this.short = def.short || '';
        this.param = def.param || this.name;
        this.required = def.required ?? true;
        this.multiple = this.type.endsWith('[]');
    }

    toString() {
        const short = this.short ? `-${this.short}, ` : '';
        const paramName = this.param || this.name;
        const suffix = this.multiple ? '...' : '';

        const paramWithSuffix = this.type == 'boolean' ? '' : `${paramName}${suffix}`;
        const param = paramWithSuffix && (this.required ? ` <${paramWithSuffix}>` : ` [${paramWithSuffix}]`);

        return `${short}--${this.name}${param}`;
    }
}

interface OptionDef<T extends TypeNames> {
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
}

interface ArgDef<T extends TypeNames> {
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

type ArgTypeDefs = {
    boolean: boolean;
    string: string;
    number: number;
    'boolean[]': boolean[];
    'string[]': string[];
    'number[]': number[];
};

export type TypeNames = keyof ArgTypeDefs;
export type ArgTypes = ArgTypeDefs[TypeNames];

export type TypeNameToType<T extends TypeNames> = T extends 'boolean'
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

export type DefToType<T extends Record<string, TypeNames>> = {
    [K in keyof T]: TypeNameToType<T[K]>;
};

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

export type ArgsDefinitions = {
    [k in string]: ArgDef<TypeNames>;
};

type ArgDefsToArgs<T extends ArgsDefinitions> = {
    [k in keyof T]: TypeNameToType<T[k]['type']>;
};

export type OptionDefinitions = {
    [k in string]: OptionDef<TypeNames>;
};

type OptDefsToOpts<T extends OptionDefinitions> = {
    [k in keyof T]: TypeNameToType<T[k]['type']>;
};

type HandlerFn<ArgDefs extends ArgsDefinitions, OptDefs extends OptionDefinitions> = (parsedArgs: {
    args: ArgDefsToArgs<ArgDefs>;
    options: OptDefsToOpts<OptDefs>;
    argv: string[];
}) => Promise<void> | void;

const cmd2 = new Command(
    'test',
    'test command',
    { globs: { description: 'globs', type: 'string[]' } },
    { verbose: { description: 'verbose', type: 'boolean', short: 'v' } },
);

cmd2.handler(({ args, options }) => {
    const globs = args.globs;
    globs.forEach((g) => console.log(g));
    console.log(args.globs);
    console.log(options.verbose);
});

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
