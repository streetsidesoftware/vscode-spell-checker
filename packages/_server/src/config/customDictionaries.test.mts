import { describe, expect, test } from 'vitest';

import type { CSpellUserSettings, CustomDictionaries, CustomDictionariesDictionary, DictionaryDefinition } from './cspellConfig/index.mjs';
import { extractDictionaryDefinitions } from './customDictionaries.mjs';

describe('customDictionaries', () => {
    const dictionaryDefinitions: DictionaryDefinition[] = [
        {
            name: 'company-terms',
            path: 'path/to/terms.txt',
        },
    ];

    test.each`
        customDictionaries                                            | expected
        ${cd('company-terms', true)}                                  | ${dictionaryDefinitions.map((d) => ({ ...d, addWords: true }))}
        ${cd('unknown-dict', true)}                                   | ${dictionaryDefinitions}
        ${cd('company-terms', { addWords: true })}                    | ${dictionaryDefinitions.map((d) => ({ ...d, addWords: true }))}
        ${cd('company-terms', { noSuggest: true })}                   | ${dictionaryDefinitions.map((d) => ({ ...d, noSuggest: true }))}
        ${cd('my-terms', { name: 'company-terms', noSuggest: true })} | ${dictionaryDefinitions.map((d) => ({ ...d, noSuggest: true }))}
        ${cd('company-terms', { path: 'new/path', addWords: true })}  | ${[{ name: 'company-terms', path: 'new/path', addWords: true }]}
    `('extractDictionaryDefinitions $customDictionaries', ({ customDictionaries, expected }) => {
        const settings: CSpellUserSettings = {
            dictionaryDefinitions,
            customDictionaries,
        };
        const r = extractDictionaryDefinitions(settings);
        expect(r).toEqual(expected);
    });
});

function cd(name: string, dict: CustomDictionariesDictionary | boolean): CustomDictionaries {
    const custom: CustomDictionaries = {};
    custom[name] = dict;
    return custom;
}
