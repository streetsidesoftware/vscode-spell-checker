import { describe, expect, test, vi } from 'vitest';
import { Uri } from 'vscode';

import { normalizePatternBase } from './globUtils.mjs';

vi.mock('vscode');

describe('globUtils', () => {
    test.each`
        pattern                   | base      | expected
        ${'**/*.ts'}              | ${u('.')} | ${['**/*.ts', u('.')]}
        ${'../**/*.ts'}           | ${u('.')} | ${['**/*.ts', u('..')]}
        ${'./**/*.ts'}            | ${u('.')} | ${['**/*.ts', u('.')]}
        ${'./one/two/three/*.ts'} | ${u('.')} | ${['*.ts', u('./one/two/three')]}
        ${'./one/two/three/'}     | ${u('.')} | ${['', u('./one/two/three/')]}
        ${'./one/two/three'}      | ${u('.')} | ${['', u('./one/two/three')]}
    `('normalizePatternBase $pattern', ({ pattern, base, expected }) => {
        const r = normalizePatternBase(pattern, base);
        expect(r).toEqual(expected);
    });
});

function u(p: string) {
    return Uri.joinPath(Uri.file(process.cwd()), p);
}
