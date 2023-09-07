import { URI as Uri, Utils as UriUtils } from 'vscode-uri';

import type { ConfigTargetCSpell, ConfigTargetDictionary, ConfigTargetVSCode } from '../client';
import type { ClientConfigTarget } from './clientConfigTarget';
import type { DictionaryTarget } from './DictionaryTarget';
import { configTargetToDictionaryTarget } from './DictionaryTargetHelper';

const fileUri = Uri.file(__filename);
const dirUri = Uri.file(__dirname);

describe('Validate DictionaryTargetHelper', () => {
    test.each`
        target                        | expected
        ${configTargetDict()}         | ${oc<DictionaryTarget>({ name: 'custom-words' })}
        ${configTargetCSpell()}       | ${oc<DictionaryTarget>({ name: 'cspell.json' })}
        ${configTargetVSCode('user')} | ${oc<DictionaryTarget>({ name: 'user' })}
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

function oc<T>(s: Partial<T>): T {
    return expect.objectContaining(s);
}

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
