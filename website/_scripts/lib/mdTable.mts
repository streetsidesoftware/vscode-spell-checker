export interface TableHeaderCell {
    key: string;
    label: string;
}

export type TableRow = string[] | Record<string, string>;
export type TableHeader = string[] | TableHeaderCell[];

export interface Table {
    header: TableHeader;
    rows: TableRow[];
}

export function renderMarkdownTable(table: Table): string {
    const { header, rows } = table;

    const headerKeys = header.map((v) => (typeof v === 'string' ? v : v.key));
    const headerLabels = header.map((v) => (typeof v === 'string' ? v : v.key));
    const headerRow = `| ${headerLabels.join(' | ')} |`;
    const separatorRow = `| ${headerLabels.map((h) => '-'.repeat(Math.max(3, h.length))).join(' | ')} |`;
    const dataRows = rows.map((row) => {
        if (Array.isArray(row)) {
            return `| ${headerKeys.map((_, i) => row[i] || '').join(' | ')} |`;
        }
        return `| ${headerKeys.map((header) => row[header] ?? '').join(' | ')} |`;
    });

    return '\n' + [headerRow, separatorRow, ...dataRows].join('\n') + '\n';
}

function cell(tag: 'th' | 'td', content: string): string[] {
    return [`<${tag}>`, '', content, '', `</${tag}>`];
}

export function renderMarkdownTableHtml(table: Table): string {
    const { header, rows } = table;

    const headerKeys = header.map((v) => (typeof v === 'string' ? v : v.key));
    const headerLabels = header.map((v) => (typeof v === 'string' ? v : v.key));
    const rowValues = rows.map((row) =>
        Array.isArray(row) ? headerKeys.map((_, i) => row[i] || '') : headerKeys.map((key) => row[key] ?? ''),
    );

    const lines: string[] = [
        '<table>',
        '<thead>',
        '<tr>',
        ...headerLabels.flatMap((h) => cell('th', h)),
        '</tr>',
        '</thead>',
        '<tbody>',
        ...rowValues.flatMap((cells) => ['<tr>', ...cells.flatMap((c) => cell('td', c)), '</tr>']),
        '</tbody>',
        '</table>',
    ];

    return '\n' + lines.join('\n') + '\n';
}
