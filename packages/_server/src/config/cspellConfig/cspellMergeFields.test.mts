import { describe, expect, test } from 'vitest';

import { filterMergeFields } from './cspellMergeFields.mjs';

describe('cspellMergeFields', () => {
    test.each`
        settings                                 | filter                             | expected
        ${{}}                                    | ${true}                            | ${{}}
        ${{ words: [] }}                         | ${true}                            | ${{ words: [] }}
        ${{ words: [] }}                         | ${undefined}                       | ${{}}
        ${{ words: [] }}                         | ${false}                           | ${{}}
        ${{ words: [], enabled: true }}          | ${{ words: false, enabled: true }} | ${{ enabled: true }}
        ${{ words: [], spellCheckDelayMs: 500 }} | ${{ enabled: true }}               | ${{ spellCheckDelayMs: 500 }}
    `('filterMergeFields $settings $filter', ({ settings, filter, expected }) => {
        expect(filterMergeFields(settings, filter)).toEqual(expected);
    });
});
