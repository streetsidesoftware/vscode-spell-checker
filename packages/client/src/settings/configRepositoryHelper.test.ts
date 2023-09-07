import { URI as Uri, Utils as UriUtils } from 'vscode-uri';

import type {
    ClientConfigTarget,
    ClientConfigTargetCSpell,
    ClientConfigTargetDictionary,
    ClientConfigTargetVSCode,
} from './clientConfigTarget';
import type { ConfigRepository } from './configRepository';
import { configTargetToConfigRepo } from './configRepositoryHelper';

const fileUri = Uri.file(__filename);
const dirUri = Uri.file(__dirname);

describe('Validate configRepositoryHelper', () => {
    test.each`
        target                        | expected
        ${configTargetDict()}         | ${undefined}
        ${configTargetCSpell()}       | ${oc<ConfigRepository>({ kind: 'cspell' })}
        ${configTargetVSCode('user')} | ${oc<ConfigRepository>({ kind: 'vscode' })}
    `(
        'configTargetToConfigRepo $target',
        ({ target, expected }: { target: ClientConfigTarget; expected: ConfigRepository | undefined }) => {
            const r = configTargetToConfigRepo(target);
            expect(r).toEqual(expected);
        },
    );

    test('configTargetToConfigRepo Unknown config', () => {
        const badTarget = { kind: 'new kind' };
        expect(() => configTargetToConfigRepo(badTarget as unknown as ClientConfigTarget)).toThrow(`Unknown target ${badTarget.kind}`);
    });
});

function oc<T>(s: Partial<T>): T {
    return expect.objectContaining(s);
}

function configTargetDict(): ClientConfigTargetDictionary {
    return {
        name: 'custom-words',
        kind: 'dictionary',
        dictionaryUri: UriUtils.joinPath(dirUri, '.cspell/words.txt'),
        scope: 'unknown',
    };
}

function configTargetCSpell(): ClientConfigTargetCSpell {
    return {
        name: 'cspell.json',
        kind: 'cspell',
        scope: 'unknown',
        configUri: UriUtils.joinPath(dirUri, '../../cspell.json'),
    };
}

function configTargetVSCode(scope: 'user' | 'workspace' | 'folder'): ClientConfigTargetVSCode {
    return {
        name: 'VSCode ' + scope,
        kind: 'vscode',
        scope,
        docUri: fileUri,
        configScope: undefined,
    };
}
