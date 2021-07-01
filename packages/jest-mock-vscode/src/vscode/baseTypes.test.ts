import type * as vscode from 'vscode';
import { EndOfLine, EnvironmentVariableMutatorType } from './baseTypes';

describe('Validate base types', () => {
    test('EndOfLine', () => {
        const a: EndOfLine = ret(EndOfLine.LF);
        const b: vscode.EndOfLine = ret(a);
        const c: EndOfLine = ret(b);
        expect(b).toBe(a);
        expect(c).toBe(b);
    });

    test('EnvironmentVariableMutatorType', () => {
        const a: EnvironmentVariableMutatorType = ret(EnvironmentVariableMutatorType.Append);
        const b: vscode.EnvironmentVariableMutatorType = ret(a);
        const c: EnvironmentVariableMutatorType = ret(b);
        expect(b).toBe(a);
        expect(c).toBe(b);
    });
});

function ret<R, T extends R>(t: T): R {
    return t;
}
