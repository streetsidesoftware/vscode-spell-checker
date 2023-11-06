import { describe, expect, test } from 'vitest';

import type {
    AllSpellCheckerSettingsInVSCode,
    AllSpellCheckerSettingsInVSCodeWithPrefix,
    CSpellUserSettings,
    SpellCheckerSettingsVSCode,
} from './cspellConfig/index.mjs';

describe('cspellConfig', () => {
    const sampleSettings: AllSpellCheckerSettingsInVSCode[] = [
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
        s({
            customDictionaries: {
                'no-suggest': {
                    path: '${workspaceFolder}/no-sug.txt',
                    description: 'Allowed, but not to be encouraged.',
                    noSuggest: true,
                },
            },
        }),
        // s({
        //     addWordsTo: {
        //         cspell: true,
        //         '#company-terms': true,
        //     },
        // }),
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

describe('Verify all config items are accounted for in configuration.', () => {
    type ArrayEntry<T extends unknown[]> = T extends (infer R)[] ? R : never;

    type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never;

    type PartialFlatConfig = AllSpellCheckerSettingsInVSCodeWithPrefix;
    type FullConfig = Required<UnionToIntersection<ArrayEntry<SpellCheckerSettingsVSCode>>>;
    type FlatConfig = Required<PartialFlatConfig>;

    test('Just make sure it compiles', () => {
        // If these functions do not compile, then there is a missing field.
        function toFull(c: FlatConfig): FullConfig {
            return c;
        }

        function toFlat(c: FullConfig): FlatConfig {
            return c;
        }

        expect(toFlat).toBeDefined();
        expect(toFull).toBeDefined();
    });
});

function s(s: AllSpellCheckerSettingsInVSCode): AllSpellCheckerSettingsInVSCode {
    return s;
}
