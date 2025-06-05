import { describe, expect, test, vi } from 'vitest';
import { URI as Uri, Utils as UriUtils } from 'vscode-uri';

import type { ConfigTargetCSpell, ConfigTargetDictionary, ConfigTargetVSCode } from '../client/index.mjs';
import type { ClientConfigTarget } from './clientConfigTarget.js';
import type { DictionaryTarget } from './DictionaryTarget.mjs';
import { configTargetToDictionaryTarget } from './DictionaryTargetHelper.mjs';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

const fileUri = Uri.parse(import.meta.url);
const dirUri = Uri.parse(new URL('.', import.meta.url).toString());

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

describe('Validate DictionaryTargetHelper', () => {
    test.each`
        target                        | expected
        ${configTargetDict()}         | ${oc({ name: 'custom-words' })}
        ${configTargetCSpell()}       | ${oc({ name: 'cspell.json' })}
        ${configTargetVSCode('user')} | ${oc({ name: 'user' })}
    `(
        'configTargetToDictionaryTarget $target',
        ({ target, expected }: { target: ClientConfigTarget; expected: DictionaryTarget | undefined }) => {
            const r = configTargetToDictionaryTarget(target);
            expect(r).toEqual(expected);
        },
    );

    test('configTargetToDictionaryTarget Unknown config', () => {
        const badTarget = { kind: 'new kind' };
        expect(() => configTargetToDictionaryTarget(badTarget as unknown as ClientConfigTarget)).toThrow(
            `Unknown target ${badTarget.kind}`,
        );
    });
});

function configTargetDict(): ConfigTargetDictionary {
    return {
        name: 'custom-words',
        kind: 'dictionary',
        dictionaryUri: UriUtils.joinPath(dirUri, '.cspell/words.txt').toString(),
        scope: 'unknown',
    };
}

function configTargetCSpell(): ConfigTargetCSpell {
    return {
        name: 'cspell.json',
        kind: 'cspell',
        scope: 'unknown',
        sortKey: 0,
        configUri: UriUtils.joinPath(dirUri, '../../cspell.json').toString(),
        has: { words: true, ignoreWords: undefined },
    };
}

function configTargetVSCode(scope: 'user' | 'workspace' | 'folder'): ConfigTargetVSCode {
    return {
        name: 'VSCode ' + scope,
        kind: 'vscode',
        scope,
        docUri: fileUri.toString(),
        folderUri: undefined,
        has: { words: true, ignoreWords: undefined },
    };
}
