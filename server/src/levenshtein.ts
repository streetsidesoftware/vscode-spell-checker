
export function calcLevenshteinMatrix(a: string, b: string) {
    const matrix: number[][] = [[]];
    const x = (' ' + a).split('');
    const y = (' ' + b).split('');


    for (let i = 0; i < x.length; ++i) {
        matrix[0][i] = i;
    }
    for (let j = 1; j < y.length; ++j) {
        matrix[j] = [];
        matrix[j][0] = j;
        for (let i = 1; i < x.length; ++i) {
            const subCost = y[j] === x[i] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j - 1][i - 1] + subCost, // substitute
                matrix[j - 1][i] + 1,           // insert
                matrix[j][i - 1] + 1            // delete
            );
        }
    }

    return matrix;
}


export function calcLevenshteinMatrixAsText(a: string, b: string) {
    const separator = ' | ';
    const matrix = calcLevenshteinMatrix(a, b);
    const header = ('  ' + a).split('').join(separator);
    const col = (' ' + b).split('');
    const rowSeparator = '-'.repeat(header.length);

    const rows = [ rowSeparator, header ];
    for (const i of col.keys()) {
        rows.push(rowSeparator);
        const rowAsStr = (col[i]
            + separator
            + matrix[i].join(separator)
        ).replace(/\s(\d\d)/g, '$1');
        rows.push(rowAsStr);
    }
    rows.push(rowSeparator);

    return rows.join('\n') + '\n';
}


