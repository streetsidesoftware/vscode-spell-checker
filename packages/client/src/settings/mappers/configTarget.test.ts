import { Uri } from 'vscode';

import type { ConfigKind, ConfigScope, ConfigTarget, ConfigTargetCSpell, ConfigTargetDictionary, ConfigTargetVSCode } from '../../client';
import { oc } from '../../test/helpers';
import type { ClientConfigTargetCSpell, ClientConfigTargetDictionary, ClientConfigTargetVSCode } from '../clientConfigTarget';
import { mapConfigTargetToClientConfigTarget } from './configTarget';

const cspellUri = Uri.joinPath(Uri.file(__dirname), 'cspell.json');
const dictUri = Uri.joinPath(Uri.file(__dirname), 'words.txt');
const docUri = Uri.file(__filename);

const cfgDoc: ConfigFiles = {
    docUri: docUri.toString(),
};

const cfgConfig: ConfigFiles = {
    configUri: cspellUri.toString(),
};

const cfgDict: ConfigFiles = {
    dictionaryUri: dictUri.toString(),
};

type Union<A, B> = {
    [kk in keyof A | keyof B]?: (kk extends keyof A ? A[kk] : undefined) | (kk extends keyof B ? B[kk] : undefined);
};

type Union3<A, B, C> = Union<Union<A, B>, C>;

type ConfigTargetUnion = Union3<ConfigTargetCSpell, ConfigTargetDictionary, ConfigTargetVSCode>;
type ClientConfigTargetUnion = Union3<ClientConfigTargetCSpell, ClientConfigTargetDictionary, ClientConfigTargetVSCode>;

describe('configTarget', () => {
    test.each`
        configTarget
        ${ct('cspell.json', 'cspell', 'unknown', cfgConfig)}
        ${ct('cspell.json', 'cspell', 'unknown', cfgConfig, cfgDoc)}
        ${ct('user', 'vscode', 'user', cfgDoc)}
        ${ct('workspace', 'vscode', 'workspace', cfgDoc)}
        ${ct('folder', 'vscode', 'folder', cfgDoc)}
        ${ct('dictionary', 'dictionary', 'unknown', cfgDict)}
        ${ct('dictionary', 'dictionary', 'unknown', cfgDict, cfgDoc)}
    `('mapConfigTargetToClientConfigTarget $configTarget', ({ configTarget }: { configTarget: ConfigTarget }) => {
        const union: ConfigTargetUnion = configTarget;
        const { name, kind, scope, docUri } = union;
        const cc = mapConfigTargetToClientConfigTarget(configTarget);
        const cct: ClientConfigTargetUnion = cc;
        expect(cct).toEqual(oc({ name, kind, scope }));
        expect(cct.docUri?.toString()).toEqual(docUri);
        expect(cct.configUri?.toString()).toEqual(union.configUri);
        expect(cct.dictionaryUri?.toString()).toEqual(union.dictionaryUri);
    });
});

interface ConfigFiles {
    dictionaryUri?: string;
    docUri?: string;
    configUri?: string;
}

function ct(name: string, kind: ConfigKind, scope: ConfigScope, cfgFile: ConfigFiles, ...cfgFiles: ConfigFiles[]) {
    const cfg = Object.assign({}, cfgFile, ...cfgFiles);
    return {
        name,
        kind,
        scope,
        ...cfg,
    };
}
