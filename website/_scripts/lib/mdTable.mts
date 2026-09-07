export type TableRow = string[] | Record<string, string>;

export interface Table {
    header: TableRow;
    rows: TableRow[];
}

export function renderMarkdownTable(table: Table): string {
    const { header, rows } = table;

    const headerKeys = Array.isArray(header) ? header : Object.keys(header);
    const headerValues = Array.isArray(header) ? header : Object.values(header);
    const headerRow = `| ${headerValues.join(' | ')} |`;
    const separatorRow = `| ${headerValues.map((h) => '-'.repeat(Math.max(3, h.length))).join(' | ')} |`;
    const dataRows = rows.map((row) => {
        if (Array.isArray(row)) {
            return `| ${headerKeys.map((_, i) => row[i] || '').join(' | ')} |`;
        }
        return `| ${headerKeys.map((header) => row[header] ?? '').join(' | ')} |`;
    });

    return '\n' + [headerRow, separatorRow, ...dataRows].join('\n') + '\n';
}
