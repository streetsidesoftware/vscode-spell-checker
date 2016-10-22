
export interface LevenshteinResultMatrix {
    matrix: number[][];   // the matrix values
    wordTop: string;      // the word across the top of the matrix
    wordSide: string;     // the word down the left side of the matrix
}

export function calcLevenshteinMatrix(a: string, b: string): LevenshteinResultMatrix {
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

    return { matrix, wordTop: a, wordSide: b };
}


export function calcLevenshteinMatrixAsText(a: string, b: string) {
    return levenshteinMatrixAsText(
        calcLevenshteinMatrix(a, b)
    );
}

export function levenshteinMatrixAsText(matrixResult: LevenshteinResultMatrix) {
    const { matrix, wordTop: a, wordSide: b } = matrixResult;
    const separator = ' | ';
    const header = ('  ' + a).split('').join(separator);
    const col = (' ' + b).split('');
    const rowSeparator = '-'.repeat(header.length);

    const rows = [ rowSeparator, header ];
    for (const i of col.keys()) {
        rows.push(rowSeparator);
        rows.push(col[i] + separator + matrix[i].join(separator));
    }
    rows.push(rowSeparator);

    return rows.join('\n') + '\n';
}

