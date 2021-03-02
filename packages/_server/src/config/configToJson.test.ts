import { CSpellSettings } from 'cspell-lib';
import { configToJson } from './configToJson';

describe('Validate configToJson', () => {
    const sampleConfig: CSpellSettings = {
        version: '0.2',
        patterns: [
            {
                name: 'word',
                pattern: /^\s*word/gim,
            },
        ],
        ignoreRegExpList: [/'.*'/g],
    };

    test.each`
        cfg                 | message
        ${{}}               | ${'empty config'}
        ${{ sampleConfig }} | ${'sampleConfig'}
    `('configToJson $message', ({ cfg }) => {
        expect(configToJson(cfg)).toMatchSnapshot();
    });
});
