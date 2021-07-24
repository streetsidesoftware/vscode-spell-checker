import { URI as Uri, Utils as UriUtils } from 'vscode-uri';
import { ConfigTarget, ConfigTargetCSpell, ConfigTargetDictionary, ConfigTargetVSCode } from '../server';
import { ConfigRepository } from './configRepository';
import { configTargetToConfigRepo } from './configRepositoryHelper';

const fileUri = Uri.file(__filename);
const dirUri = Uri.file(__dirname);

describe('Validate configRepositoryHelper', () => {
    test.each`
        target                        | expected
        ${configTargetDict()}         | ${undefined}
        ${configTargetCSpell()}       | ${oc<ConfigRepository>({ kind: 'cspell' })}
        ${configTargetVSCode('user')} | ${oc<ConfigRepository>({ kind: 'vscode' })}
    `('configTargetToConfigRepo $target', ({ target, expected }: { target: ConfigTarget; expected: ConfigRepository | undefined }) => {
        const r = configTargetToConfigRepo(target);
        expect(r).toEqual(expected);
    });

    test('configTargetToConfigRepo Unknown config', () => {
        const badTarget = { kind: 'new kind' };
        expect(() => configTargetToConfigRepo(badTarget as unknown as ConfigTarget)).toThrowError(`Unknown target ${badTarget.kind}`);
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
        has: { words: true, ignoreWords: undefined },
    };
}
