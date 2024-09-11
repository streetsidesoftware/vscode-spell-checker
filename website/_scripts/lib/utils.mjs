/**
 * @param {string} str - multi-line string to left pad
 * @param {string} [padding] - the padding to use
 * @param {string} [firstLinePadding] - optional padding of first line.
 */
export function padLines(str, padding = '', firstLinePadding = '') {
    let pad = firstLinePadding;
    const lines = [];
    for (const line of str.split('\n')) {
        lines.push(pad + line);
        pad = padding;
    }

    return lines.join('\n');
}
/**
 * Inject values into a template string.
 * @param {TemplateStringsArray | string} template
 * @param  {...any} values
 * @returns
 */
export function unindent(template, ...values) {
    if (typeof template === 'string') return _unindent(template);
    const strings = template;
    const adjValues = [];
    for (let i = 0; i < values.length; ++i) {
        const prevLines = strings[i].split('\n');
        const currLine = prevLines[prevLines.length - 1];
        const padLen = padLength(currLine);
        const padding = ' '.repeat(padLen);
        const value = `${values[i]}`;
        let pad = '';
        const valueLines = [];
        for (const line of value.split('\n')) {
            valueLines.push(pad + line);
            pad = padding;
        }
        adjValues.push(valueLines.join('\n'));
    }

    return _unindent(String.raw({ raw: strings }, ...adjValues));
}
/**
 *
 * @param {string[]} headers
 * @param {string[][]} rows
 * @returns
 */
export function createTable(headers, rows) {
    const colWidths = [];

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
 * @param {string} s
 * @returns {number}
 */
function padLength(s) {
    return s.length - s.trimStart().length;
}

/**
 * Remove the left padding from a multi-line string.
 * @param {string} str
 * @returns {string}
 */
function _unindent(str) {
    const lines = str.split('\n');
    let curPad = str.length;
    for (const line of lines) {
        if (!line.trim()) continue;
        curPad = Math.min(curPad, padLength(line));
    }

    return lines.map((line) => line.slice(curPad)).join('\n');
}
