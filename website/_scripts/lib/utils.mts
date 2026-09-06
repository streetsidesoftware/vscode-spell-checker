/**
 * @param str - multi-line string to left pad
 * @param padding - the padding to use
 * @param firstLinePadding - optional padding of first line.
 */
export function padLines(str: string, padding = '', firstLinePadding = ''): string {
    let pad = firstLinePadding;
    const lines: string[] = [];
    for (const line of str.split('\n')) {
        lines.push(pad + line);
        pad = padding;
    }

    return lines.join('\n');
}

/**
 * Inject values into a template string.
 */
export function unindent(template: TemplateStringsArray | string, ...values: unknown[]): string {
    if (typeof template === 'string') return _unindent(template);
    const strings = template;
    const adjValues: string[] = [];
    for (let i = 0; i < values.length; ++i) {
        const prevLines = strings[i].split('\n');
        const currLine = prevLines[prevLines.length - 1];
        const padLen = padLength(currLine);
        const padding = ' '.repeat(padLen);
        const value = `${values[i]}`;
        let pad = '';
        const valueLines: string[] = [];
        for (const line of value.split('\n')) {
            valueLines.push(pad + line);
            pad = padding;
        }
        adjValues.push(valueLines.join('\n'));
    }

    return _unindent(String.raw({ raw: strings }, ...adjValues));
}

export function createTable(headers: string[], rows: string[][]): string {
    const colWidths: number[] = [];

    for (const row of [headers, ...rows]) {
        row.forEach((col, i) => {
            colWidths[i] = Math.max(colWidths[i] || 0, [...col].length);
        });
    }

    const rowPlaceholders = colWidths.map(() => '');
    const sep = headers.map((_, i) => '---'.padEnd(colWidths[i], '-'));
    const table = [headers, sep, ...rows];

    return table
        .map((row) => [...row, ...rowPlaceholders.slice(row.length)])
        .map((row) => row.map((col, i) => col.padEnd(colWidths[i])))
        .map((row) => `| ${row.join(' | ')} |`)
        .join('\n');
}

/**
 * Calculate the padding at the start of the string.
 */
function padLength(s: string): number {
    return s.length - s.trimStart().length;
}

/**
 * Remove the left padding from a multi-line string.
 */
function _unindent(str: string): string {
    const lines = str.split('\n');
    let curPad = str.length;
    for (const line of lines) {
        if (!line.trim()) continue;
        curPad = Math.min(curPad, padLength(line));
    }

    return lines.map((line) => line.slice(curPad)).join('\n');
}
