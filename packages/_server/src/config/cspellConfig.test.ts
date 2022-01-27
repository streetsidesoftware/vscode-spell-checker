import { SpellCheckerSettingsVSCode, CSpellUserSettings } from './cspellConfig';

describe('cspellConfig', () => {
    const sampleSettings: SpellCheckerSettingsVSCode[] = [
        s({}),
        s({
            overrides: [
                {
                    filename: '*.mdx',
                    languageId: 'markdown',
                    languageSettings: [
                        {
                            languageId: 'markdown',
                            caseSensitive: true,
                            allowCompoundWords: false,
                        },
                    ],
                },
            ],
        }),
        s({
            language: 'en',
            dictionaryDefinitions: [
                {
                    name: 'my-dictionary',
                    path: './words.txt',
                    addWords: true,
                },
                {
                    name: 'another',
                    path: './more-words.txt',
                    addWords: true,
                    scope: 'workspace',
                },
                {
                    name: 'no-suggest',
                    path: './no-suggest.txt',
                    noSuggest: true,
                },
                {
                    name: 'all-no-suggest',
                    path: './no-suggest.txt',
                    noSuggest: true,
                    addWords: true,
                },
            ],
            overrides: [
                {
                    filename: '*.ts',
                    language: 'en-GB',
                    dictionaries: ['m-dictionary'],
                    dictionaryDefinitions: [
                        {
                            name: 'my-dictionary',
                            path: './other-words.txt',
                        },
                    ],
                },
            ],
        }),
    ];

    test('sampleSettings', () => {
        // This is more of a compile test than a unit test.
        // The idea is to use features of the configuration and make sure it compiles.
        expect(sampleSettings).toBeDefined();

        const moreSettings: CSpellUserSettings[] = sampleSettings;

        expect(moreSettings).toBeDefined();

        // Below is not possible:
        // const x: SpellCheckerSettingsVSCode[] = moreSettings;
    });
});

function s(s: SpellCheckerSettingsVSCode): SpellCheckerSettingsVSCode {
    return s;
}
