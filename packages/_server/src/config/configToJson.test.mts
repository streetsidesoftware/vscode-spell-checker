import type { CSpellSettingsWithSourceTrace } from 'cspell-lib';
import { describe, expect, test } from 'vitest';

import { configToJson } from './configToJson.mjs';

describe('Validate configToJson', () => {
    const sampleConfig: CSpellSettingsWithSourceTrace = {
        version: '0.2',
        patterns: [
            {
                name: 'word',
                pattern: /^\s*word/gim,
            },
        ],
        ignoreRegExpList: [/'.*'/g],
        source: {
            name: 'source',
        },
    };

    test.each`
        cfg             | message
        ${{}}           | ${'empty config'}
        ${sampleConfig} | ${'sampleConfig'}
    `('configToJson $message', ({ cfg }) => {
        expect(configToJson(cfg, ['source'])).toMatchSnapshot();
    });
});
