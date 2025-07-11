import type { CSpellSettings } from '@cspell/cspell-types';
import * as cspell from 'cspell-lib';
import { describe, expect, test, vi } from 'vitest';
import {} from 'vscode';

import { isDefined } from '../util/index.mjs';
import { __testing__ } from './infoHelper.mjs';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

const { extractDictionariesFromConfig, normalizeLocales, extractEnabledLanguageIds } = __testing__;

describe('infoHelper', () => {
    test.each`
        languageIds         | enableFiletypes | enabledFileTypes  | expected
        ${[]}               | ${[]}           | ${{}}             | ${[]}
        ${['cpp']}          | ${['!cpp']}     | ${{}}             | ${[]}
        ${['!cpp']}         | ${['!!cpp']}    | ${{}}             | ${['cpp']}
        ${['!cpp', 'js']}   | ${['!!cpp']}    | ${{}}             | ${['cpp', 'js']}
        ${['!!!cpp', 'js']} | ${[]}           | ${{ cpp: false }} | ${['js']}
    `(
        'applyEnableFiletypesToEnabledLanguageIds $languageIds, $enableFiletypes',
        ({ languageIds, enableFiletypes, enabledFileTypes, expected }) => {
            expect(extractEnabledLanguageIds({ enabledLanguageIds: languageIds, enableFiletypes, enabledFileTypes }).sort()).toEqual(
                expected,
            );
        },
    );

    test.each`
        locale                | expected
        ${''}                 | ${[]}
        ${'en-US, en_GB'}     | ${['en-US', 'en_GB']}
        ${'en-US;nl'}         | ${['en-US', 'nl']}
        ${['en-US;nl', 'es']} | ${['en-US', 'nl', 'es']}
    `('normalizeLocales $locale', ({ locale, expected }) => {
        expect(normalizeLocales(locale)).toEqual(expected);
    });

    test('extractDictionariesFromConfig', async () => {
        const cfg = await sampleCSpellSettings();
        expect(extractDictionariesFromConfig(cfg)).toEqual(
            expect.arrayContaining([
                {
                    description: 'American English Dictionary',
                    languageIds: [],
                    locales: ['en', 'en-US'],
                    name: 'en_us',
                },
                {
                    description: 'Lorem-ipsum dictionary.',
                    languageIds: [],
                    locales: ['lorem', 'lorem-ipsum'],
                    name: 'lorem-ipsum',
                },
                {
                    description: undefined,
                    languageIds: [],
                    locales: [],
                    name: 'cspell-words',
                    uri: expect.stringContaining('cspell-words.txt'),
                    uriName: expect.stringContaining('cspell-words.txt'),
                },
            ]),
        );
    });

    test('extractDictionariesFromConfig undefined', () => {
        expect(extractDictionariesFromConfig(undefined)).toEqual([]);
    });
});

let sampleSettings: CSpellSettings | undefined;

async function sampleCSpellSettings() {
    if (sampleSettings) return sampleSettings;
    const localCfg = await cspell.searchForConfig(__filename);
    const defaultSettings = await cspell.getDefaultSettings();
    sampleSettings = cspell.mergeSettings(defaultSettings, /*cspell.getGlobalSettings(),*/ ...[localCfg].filter(isDefined));
    return sampleSettings;
}
