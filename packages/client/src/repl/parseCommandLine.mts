import assert from 'node:assert';

const escapeSequenceMap: Record<string, string> = {
    n: '\n',
    r: '\r',
    t: '\t',
    // b: '\b',
    f: '\f',
    // 0: '\0',
    '"': '"',
    "'": "'",
};

export function parseCommandLineIntoArgs(line: string): string[] {
    return argTokensToArgs(parseCommandLineIntoTokens(line));
}

type QuoteChar = '"' | "'" | '`' | '';

interface ArgToken {
    /** The parsed value */
    value: string;
    /**
     * The original value before parsing.
     * tokens.map(t => t.original).join('') === line
     */
    original: string;
    /**
     * The quote character used to parse the value.
     */
    quote: QuoteChar;
    /**
     * True if the token is an argument separator instead of an argument value.
     */
    separator: boolean;
    /**
     * The index of the token in the original line.
     */
    i?: number;
}

const separatorChars = [' ', '\t', '\n', '\r'];

export function parseCommandLineIntoTokens(line: string): ArgToken[] {
    const tokens: ArgToken[] = [];

    let i = 0;
    let j = 0;
    let arg: string | undefined;

    while (i < line.length) {
        const c = line[i];
        switch (c) {
            case '\n':
            case '\r':
            case '\t':
            case ' ':
                pushToken(arg);
                arg = undefined;
                pushToken(parseSeparator(), true);
                break;
            case '\\':
                if (['\n', '\r'].includes(line[i + 1])) {
                    pushToken(arg);
                    arg = undefined;
                    pushToken(parseSeparator(), true);
                    continue;
                }
                arg = (arg || '') + parseSlash();
                break;
            case '"':
            case "'":
            case '`':
                pushToken(arg);
                arg = undefined;
                pushToken(parseQuote(), false, c as QuoteChar);
                break;
            default:
                arg = (arg || '') + c;
                ++i;
                break;
        }
    }

    pushToken(arg);

    return tokens;

    function pushToken(value: string | undefined, separator = false, quote: QuoteChar = '') {
        if (value !== undefined) {
            tokens.push({ i, value: value, original: line.slice(j, i), quote, separator });
            j = i;
        }
    }

    function parseSeparator() {
        let sep = line[i++];
        for (; i < line.length && separatorChars.includes(line[i]); i++) {
            sep += line[i];
        }
        return sep;
    }

    function parseSlash() {
        assert(line[i] === '\\');
        ++i;
        if (i >= line.length) {
            return '\\';
        }
        return line[i++];
    }

    function parseQuoteEscape() {
        if (i >= line.length) {
            return '\\';
        }
        const c = line[i++];
        if (c === '\n' || c === '\r') {
            if (c === '\r' && line[i] === '\n') {
                ++i;
            }
            return '';
        }
        if (c in escapeSequenceMap) return escapeSequenceMap[c];
        return '\\' + c;
    }

    function parseQuote() {
        const quote = line[i++];
        let arg = '';
        while (i < line.length) {
            const c = line[i++];
            if (c === '\\') {
                arg += parseQuoteEscape();
            } else if (c === quote) {
                return arg;
            } else {
                arg += c;
            }
        }
        return arg;
    }
}

const escapeQuotedStringMap: Record<string, string> = {
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\f': '\\f',
    '\\': '\\\\',
};

/**
 * Escape characters that are special in a command line.
 *
 * The following have not been included to support future support of environment variables.
 * `'(', ')', '$'`
 */
const specialCommandLineChars = [' ', '&', ';', '|', '<', '>', '`', '"', "'", '\\'];
const specialCommandLineCharsMap = Object.fromEntries(specialCommandLineChars.map((c) => [c, '\\' + c]));

const escapeMap: Record<string, string> = { ...escapeQuotedStringMap, ...specialCommandLineCharsMap };

export interface ParsedCommandLine {
    readonly line: string;
    readonly args: string[];
    readonly tokens: ArgToken[];
}

export function parseCommandLine(line: string): ParsedCommandLine {
    return new CParsedCommandLine(parseCommandLineIntoTokens(line));
}

export function argTokensToArgs(tokens: ArgToken[]): string[] {
    const args = argTokensToArgWithTokens(tokens);
    return args.map((a) => a.arg);
}

interface ArgWithTokens {
    arg: string;
    startTokenIndex: number;
    tokens: ArgToken[];
}

export function argTokensToArgWithTokens(tokens: ArgToken[]): ArgWithTokens[] {
    const args: ArgWithTokens[] = [];
    let arg: ArgWithTokens | undefined = undefined;
    for (const [index, t] of tokens.entries()) {
        if (t.separator) {
            if (arg !== undefined) {
                args.push(arg);
                arg = undefined;
            }
            continue;
        }
        if (!arg) {
            arg = { arg: t.value, startTokenIndex: index, tokens: [t] };
            continue;
        }
        arg.arg += t.value;
        arg.tokens.push(t);
    }

    if (arg !== undefined) {
        args.push(arg);
    }

    return args;
}

class CParsedCommandLine implements ParsedCommandLine {
    constructor(readonly tokens: ArgToken[]) {}
    get line() {
        return this.tokens.map((t) => t.original).join('');
    }
    get args() {
        return argTokensToArgs(this.tokens);
    }
}

export function commandLineBuilder(line: string): CommandLineBuilder {
    return new CommandLineBuilder(parseCommandLineIntoTokens(line));
}

export class CommandLineBuilder {
    constructor(readonly tokens: Readonly<ArgToken>[] = []) {}

    get line(): string {
        return this.tokens.map((t) => t.original).join('');
    }
    get args(): string[] {
        return argTokensToArgs(this.tokens);
    }

    setArg(index: number, value: string, quote?: QuoteChar): void {
        const args = argTokensToArgWithTokens(this.tokens);
        const arg = args[index];
        assert(arg, 'Invalid index');
        quote ??= arg.tokens[0].quote;
        this.tokens.splice(arg.startTokenIndex, arg.tokens.length, { value, original: encodeArg(value, quote), quote, separator: false });
    }

    pushArg(value: string, quote: QuoteChar = ''): void {
        const token: ArgToken = { value, original: encodeArg(value, quote), quote, separator: false };
        const lastToken = this.tokens[this.tokens.length - 1];
        if (lastToken && !lastToken.separator) {
            this.pushSeparator();
        }
        this.tokens.push(token);
    }

    hasTrailingSeparator(): boolean {
        return this.tokens[this.tokens.length - 1]?.separator || false;
    }

    pushSeparator(value: ' ' | '\t' | '\n' | '\r' = ' '): void {
        this.tokens.push({ value, original: value, quote: '', separator: true });
    }

    clone(): CommandLineBuilder {
        return new CommandLineBuilder([...this.tokens]);
    }
}

export function encodeArg(arg: string, quote: QuoteChar = ''): string {
    if (!arg) return quote + quote || '""';

    if (quote) {
        return quoteString(arg, quote);
    }

    return escapeArg(arg);
}

function quoteString(value: string, quote: QuoteChar): string {
    assert(quote === '"' || quote === "'", 'Invalid quote');

    let arg = '';

    for (const c of value) {
        const v = escapeQuotedStringMap[c] || c;
        if (v === quote) {
            arg += '\\' + quote;
        } else {
            arg += v;
        }
    }

    return quote + arg + quote;
}

function escapeArg(value: string): string {
    if (!value) return '""';

    let arg = '';

    for (const c of value) {
        arg += escapeMap[c] || c;
    }

    return arg;
}
