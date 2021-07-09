import { mocked } from 'ts-jest/utils';
import { getCSpellDiags } from './diags';
import { languages, Uri, Diagnostic, Range, Position, DiagnosticSeverity } from 'vscode';

const mockGetDiagnostics = mocked(languages.getDiagnostics);

describe('Validate diags', () => {
    test('getCSpellDiags empty', () => {
        const uri = Uri.file(__filename);
        mockGetDiagnostics.mockReturnValue([]);
        const r = getCSpellDiags(uri);
        expect(r).toEqual([]);
    });

    test('getCSpellDiags', () => {
        const uri = Uri.file(__filename);
        mockGetDiagnostics.mockImplementation(implGetDiagnostics);
        const r = getCSpellDiags(uri);
        expect(r).toHaveLength(2);
    });

    test('getCSpellDiags undefined', () => {
        mockGetDiagnostics.mockImplementation(implGetDiagnostics);
        const r = getCSpellDiags(undefined);
        expect(r).toHaveLength(0);
    });
});

function implGetDiagnostics(): [Uri, Diagnostic[]][];
function implGetDiagnostics(uri: Uri): Diagnostic[];
function implGetDiagnostics(uri?: Uri): [Uri, Diagnostic[]][] | Diagnostic[] {
    if (!uri) return sampleDiags();
    return sampleDiags()[0][1];
}

function sampleDiags(): [Uri, Diagnostic[]][] {
    const uriDir = Uri.file(__dirname);
    return [
        [Uri.file(__filename), [fakeDiag('eslint', 'eslint'), fakeDiag('Unknown word ', 'cSpell'), fakeDiag('Unknown word 2', 'cSpell')]],
        [Uri.joinPath(uriDir, 'other.js'), [fakeDiag('eslint', 'eslint'), fakeDiag('Unknown word ', 'cSpell')]],
        [Uri.joinPath(uriDir, 'this.js'), [fakeDiag('eslint', 'eslint'), fakeDiag('Unknown word ', 'cSpell')]],
    ];
}

function fakeDiag(message: string, source: string): Diagnostic {
    const posA = new Position(1, 0);
    const posB = new Position(1, 5);
    const range = new Range(posA, posB);

    const diag = new Diagnostic(range, message, DiagnosticSeverity.Information);
    diag.source = source;
    return diag;
}
