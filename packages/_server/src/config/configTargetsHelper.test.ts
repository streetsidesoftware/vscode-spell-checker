import { calculateConfigTargets, __testing__ } from './configTargetsHelper';
import { WorkspaceConfigForDocument } from '../api';
import { URI } from 'vscode-uri';
import { searchForConfig } from 'cspell-lib';
import { extractCSpellFileConfigurations, extractTargetDictionaries } from './documentSettings';
import { mustBeDefined } from 'common-utils/util.js';
import { ConfigTargetCSpell, ConfigTargetDictionary, ConfigTargetVSCode } from './configTargets';
import * as Path from 'path';

const { workspaceConfigToTargets, cspellToTargets, dictionariesToTargets, sortTargets } = __testing__;

describe('Validate configTargetsHelper', () => {
    test('workspaceConfigToTargets in single root workspace', () => {
        const wConfig: WorkspaceConfigForDocument = {
            uri: URI.file(__filename).toString(),
            workspaceFile: undefined,
            workspaceFolder: URI.file(__dirname).toString(),
            words: {
                user: true,
            },
            ignoreWords: {},
        };
        const r = [...workspaceConfigToTargets(wConfig)];
        expect(r).toEqual([
            oc<ConfigTargetVSCode>({
                kind: 'vscode',
                scope: 'user',
                name: 'User',
                docUri: expect.stringContaining('file:'),
                has: { words: true, ignoreWords: undefined },
            }),
            oc<ConfigTargetVSCode>({
                kind: 'vscode',
                scope: 'workspace',
                name: 'Workspace',
                docUri: expect.stringContaining('file:'),
                has: { words: undefined, ignoreWords: undefined },
            }),
        ]);
    });

    test('workspaceConfigToTargets in multi root workspace', () => {
        const wConfig: WorkspaceConfigForDocument = {
            uri: URI.file(__filename).toString(),
            workspaceFile: 'file://workspace-file.code-workspace',
            workspaceFolder: URI.file(__dirname).toString(),
            words: {
                user: true,
                folder: true,
            },
            ignoreWords: {
                folder: true,
            },
        };
        const r = [...workspaceConfigToTargets(wConfig)];
        expect(r).toEqual([
            oc<ConfigTargetVSCode>({
                kind: 'vscode',
                scope: 'user',
                name: 'User',
                docUri: wConfig.uri,
                has: { words: true, ignoreWords: undefined },
            }),
            oc<ConfigTargetVSCode>({
                kind: 'vscode',
                scope: 'workspace',
                name: 'Workspace',
                docUri: wConfig.uri,
                has: { words: undefined, ignoreWords: undefined },
            }),
            oc<ConfigTargetVSCode>({
                kind: 'vscode',
                scope: 'folder',
                name: 'Folder',
                docUri: wConfig.uri,
                has: { words: true, ignoreWords: true },
            }),
        ]);
    });

    test('workspaceConfigToTargets with no workspace', () => {
        const wConfig: WorkspaceConfigForDocument = {
            uri: URI.file(__filename).toString(),
            workspaceFile: undefined,
            workspaceFolder: undefined,
            words: {
                user: true,
            },
            ignoreWords: {},
        };
        const r = [...workspaceConfigToTargets(wConfig)];
        expect(r).toEqual([
            oc<ConfigTargetVSCode>({
                kind: 'vscode',
                scope: 'user',
                name: 'User',
                docUri: wConfig.uri,
                has: { words: true, ignoreWords: undefined },
            }),
        ]);
    });

    test('cspellToTargets', async () => {
        const cfg = mustBeDefined(await searchForConfig(__dirname));
        const sources = extractCSpellFileConfigurations(cfg);
        const r = cspellToTargets(sources);
        expect(r).toEqual([
            oc<ConfigTargetCSpell>({
                kind: 'cspell',
                name: '_server/cspell.json',
                scope: 'unknown',
                configUri: expect.stringContaining('_server/cspell.json'),
                has: { words: undefined, ignoreWords: undefined },
            }),
            oc<ConfigTargetCSpell>({
                kind: 'cspell',
                name: expect.stringContaining('cSpell.json'),
                scope: 'unknown',
                configUri: expect.not.stringContaining('_server/cspell.json'),
                has: { words: undefined, ignoreWords: true },
            }),
        ]);
    });

    test('dictionariesToTargets', async () => {
        const cfg = mustBeDefined(await searchForConfig(__dirname));
        const dictionaries = extractTargetDictionaries(cfg).concat([
            {
                name: 'local-words',
                path: Path.join(__dirname, 'local-words.txt'),
                addWords: true,
            },
            {
                name: 'user-words',
                path: Path.join(__dirname, 'user-words.txt'),
                addWords: true,
                scope: 'user',
            },
        ]);
        const r = sortTargets(dictionariesToTargets(dictionaries));
        expect(r).toEqual([
            oc<ConfigTargetDictionary>({
                kind: 'dictionary',
                name: 'local-words',
                scope: 'unknown',
                dictionaryUri: expect.stringContaining('local-words.txt'),
            }),
            oc<ConfigTargetDictionary>({
                kind: 'dictionary',
                name: 'cspell-words',
                scope: 'workspace',
                dictionaryUri: expect.stringContaining('cspell-words.txt'),
            }),
            oc<ConfigTargetDictionary>({
                kind: 'dictionary',
                name: 'user-words',
                scope: 'user',
                dictionaryUri: expect.stringContaining('user-words.txt'),
            }),
        ]);
    });

    test('calculateConfigTargets', async () => {
        const wConfig: WorkspaceConfigForDocument = {
            uri: URI.file(__filename).toString(),
            workspaceFile: undefined,
            workspaceFolder: URI.file(__dirname).toString(),
            words: {
                user: true,
            },
            ignoreWords: {},
        };
        const cfg = mustBeDefined(await searchForConfig(__dirname));
        const r = calculateConfigTargets(cfg, wConfig);
        expect(r).toEqual([
            oc<ConfigTargetDictionary>({
                kind: 'dictionary',
                name: 'cspell-words',
                scope: 'workspace',
                dictionaryUri: expect.stringContaining('cspell-words.txt'),
            }),
            oc<ConfigTargetCSpell>({
                kind: 'cspell',
                name: '_server/cspell.json',
                scope: 'unknown',
                configUri: expect.stringContaining('_server/cspell.json'),
                has: { words: undefined, ignoreWords: undefined },
            }),
            oc<ConfigTargetCSpell>({
                kind: 'cspell',
                name: expect.stringContaining('cSpell.json'),
                scope: 'unknown',
                configUri: expect.not.stringContaining('_server/cspell.json'),
                has: { words: undefined, ignoreWords: true },
            }),
            oc<ConfigTargetVSCode>({
                kind: 'vscode',
                scope: 'workspace',
                name: 'Workspace',
                docUri: expect.stringContaining('file:'),
                has: { words: undefined, ignoreWords: undefined },
            }),
            oc<ConfigTargetVSCode>({
                kind: 'vscode',
                scope: 'user',
                name: 'User',
                docUri: expect.stringContaining('file:'),
                has: { words: true, ignoreWords: undefined },
            }),
        ]);
    });
});

function oc<T>(v: Partial<T>): T {
    return expect.objectContaining(v);
}
