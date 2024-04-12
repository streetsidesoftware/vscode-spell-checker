import { describe, expect, test, vi } from 'vitest';

import { formatPath } from './formatPath.mjs';

vi.mock('vscode');

describe('formatPath', () => {
    test.each`
        path                         | width | expected
        ${'a/b/c'}                   | ${15} | ${'a/b/c'}
        ${'one'}                     | ${15} | ${'one'}
        ${'one/two'}                 | ${15} | ${'one/two'}
        ${'one/two/three'}           | ${15} | ${'one/two/three'}
        ${'one/two/three/four'}      | ${15} | ${'one/two/…/four'}
        ${'one/two/three/four/five'} | ${13} | ${'one/…/five'}
        ${'one/two/three/four/five'} | ${14} | ${'one/two/…/five'}
        ${'one/two/three/four/five'} | ${18} | ${'one/two/…/five'}
        ${'one/two/three/four/five'} | ${19} | ${'one/two/…/four/five'}
        ${'one_two_three_four_five'} | ${11} | ${'…_four_five'}
    `('formatPath $path, $width', ({ path, width, expected }) => {
        const rel = formatPath(path, width);
        expect(rel).toBe(expected);
        expect(rel.length).toBeLessThanOrEqual(width);
    });
});
