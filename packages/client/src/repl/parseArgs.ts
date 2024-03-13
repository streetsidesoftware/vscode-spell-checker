const escapeSequenceMap: Record<string, string> = {
    n: '\n',
    r: '\r',
    t: '\t',
    // b: '\b',
    f: '\f',
    // 0: '\0',
    '"': '"',
    "'": "'",
    '\\': '\\',
    '\n': '',
};

export function parseArgs(line: string): string[] {
    const args: string[] = [];

    let i = 0;
    let arg: string | undefined;
    while (i < line.length) {
        const c = line[i++];
        switch (c) {
            case ' ':
                if (arg !== undefined) {
                    args.push(arg);
                    arg = undefined;
                }
                break;
            case '\\':
                arg = (arg || '') + parseSlash();
                break;
            case '"':
            case "'":
            case '`':
                arg = (arg || '') + parseQuote(c);
                break;
            default:
                arg = (arg || '') + c;
                break;
        }
    }

    if (arg !== undefined) {
        args.push(arg);
    }

    return args;

    function parseSlash() {
        if (i >= line.length) {
            return '\\';
        }
        return line[i++];
    }

    function parseEscape() {
        if (i >= line.length) {
            return '\\';
        }
        const c = line[i++];
        if (c in escapeSequenceMap) return escapeSequenceMap[c];
        return '\\' + c;
    }

    function parseQuote(quote: string) {
        let arg = '';
        while (i < line.length) {
            const c = line[i++];
            if (c === '\\') {
                arg += parseEscape();
            } else if (c === quote) {
                return arg;
            } else {
                arg += c;
            }
        }
        return arg;
    }
}

const regExpSpecialCharacters = /[\\\n\t\r"'`\f]/;

const escapeMap: Record<string, string> = {
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\f': '\\f',
    '"': '\\"',
    '\\': '\\\\',
};

export function argsToCommandLine(args: string[]): string {
    return args.map(quoteIfNeeded).join(' ');

    function quoteIfNeeded(arg: string) {
        if (!arg) return '""';
        if (!regExpSpecialCharacters.test(arg)) {
            return arg.replace(/ /g, '\\ ');
        }
        let value = '';
        for (let i = 0; i < arg.length; i++) {
            value += escapeIfNeeded(arg[i]);
        }
        return '"' + value + '"';
    }

    function escapeIfNeeded(c: string) {
        return escapeMap[c] || c;
    }
}
