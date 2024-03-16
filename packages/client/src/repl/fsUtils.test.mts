import { describe, expect, test, vi } from 'vitest';
import { Uri } from 'vscode';

import { relativePath } from './fsUtils.mjs';

vi.mock('vscode');

describe('fsUtils', () => {
    test.each`
        a          | b            | expected
        ${'a/b/c'} | ${'a/b/c/d'} | ${'d'}
        ${'a/b/c'} | ${'a/c/d'}   | ${'../../c/d'}
        ${'a/b/'}  | ${'a/c/d'}   | ${'../c/d'}
        ${'a/b/c'} | ${'a/b/c'}   | ${''}
    `('relativePath $a $b', ({ a, b, expected }) => {
        expect(relativePath(u(a), u(b))).toBe(expected);
    });
});

function u(p: string | Uri): Uri {
    return p instanceof Uri ? p : Uri.joinPath(Uri.file(process.cwd()), p);
}
