import { describe, expect, test } from 'vitest';

import { filterMergeFields } from './cspellMergeFields.mjs';

describe('cspellMergeFields', () => {
    test.each`
        settings                                 | merge        | filter                             | expected
        ${{}}                                    | ${true}      | ${undefined}                       | ${{}}
        ${{ words: [] }}                         | ${true}      | ${undefined}                       | ${{ words: [] }}
        ${{ words: [] }}                         | ${true}      | ${{}}                              | ${{ words: [] }}
        ${{ words: [] }}                         | ${undefined} | ${undefined}                       | ${{}}
        ${{ words: [] }}                         | ${false}     | ${{}}                              | ${{}}
        ${{ words: [], enabled: true }}          | ${true}      | ${{ words: false, enabled: true }} | ${{ enabled: true }}
        ${{ words: [], enabled: true }}          | ${true}      | ${{ enabled: true }}               | ${{ words: [], enabled: true }}
        ${{ words: [], spellCheckDelayMs: 500 }} | ${true}      | ${{ enabled: true }}               | ${{ words: [], spellCheckDelayMs: 500 }}
        ${{ words: [], spellCheckDelayMs: 500 }} | ${false}     | ${{ enabled: true }}               | ${{ spellCheckDelayMs: 500 }}
    `('filterMergeFields $settings $merge $filter', ({ settings, merge, filter, expected }) => {
        expect(filterMergeFields(settings, merge, filter)).toEqual(expected);
    });
});
