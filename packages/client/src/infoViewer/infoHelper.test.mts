import type { CSpellSettings } from '@cspell/cspell-types';
import * as cspell from 'cspell-lib';
import { describe, expect, test, vi } from 'vitest';
import {} from 'vscode';

import { isDefined } from '../util/index.mjs';
import { __testing__ } from './infoHelper.mjs';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

const { extractDictionariesFromConfig, normalizeLocales, extractEnabledLanguageIds, mapWorkspace } = __testing__;

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

    test('extractDictionariesFromConfig undefined', async () => {
        expect(extractDictionariesFromConfig(undefined)).toEqual([]);
    });

    describe('mapWorkspace scheme filtering', () => {
        interface FakeDoc {
            uri: { scheme: string; toString: () => string };
            fileName: string;
            languageId: string;
            isUntitled: boolean;
        }

        function doc(scheme: string): FakeDoc {
            return {
                uri: { scheme, toString: () => `${scheme}://path/to/file.txt` },
                fileName: '/path/to/file.txt',
                languageId: 'plaintext',
                isUntitled: false,
            };
        }

        function docUris(enabledSchemes: Record<string, boolean>, schemes: string[]): (string | undefined)[] {
            const ws = mapWorkspace(enabledSchemes, {
                name: undefined,
                workspaceFolders: undefined,
                textDocuments: schemes.map(doc) as never[],
            });
            return (ws.textDocuments || []).map((d) => d.uri);
        }

        test('wildcard allows unknown schemes but not explicitly blocked ones', () => {
            const uris = docUris({ file: true, untitled: true, '*': true, git: false, output: false, debug: false }, [
                'file',
                'untitled',
                'sftp',
                'git',
                'output',
                'debug',
            ]);
            expect(uris).toHaveLength(3);
            expect(uris).toEqual(
                expect.arrayContaining(['file://path/to/file.txt', 'untitled://path/to/file.txt', 'sftp://path/to/file.txt']),
            );
        });

        test('without wildcard only explicitly enabled schemes are listed', () => {
            const uris = docUris({ file: true, git: false }, ['file', 'git', 'untitled']);
            expect(uris).toEqual(['file://path/to/file.txt']);
        });

        test('wildcard set to false blocks unknown schemes', () => {
            const uris = docUris({ file: true, '*': false }, ['file', 'sftp']);
            expect(uris).toEqual(['file://path/to/file.txt']);
        });
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
