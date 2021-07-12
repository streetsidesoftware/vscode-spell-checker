export type ConfigKind = 'cspell' | 'dictionary' | 'vscode';
export type ConfigScope = 'user' | 'workspace' | 'folder' | 'unknown';

type CombineWithScope<T extends string> = {
    [key in ConfigScope as `${T}_${key}`]: number;
};

type ConfigWeights = CombineWithScope<ConfigKind>;

const configWeights: ConfigWeights = {
    dictionary_unknown: 330,
    dictionary_folder: 330,
    dictionary_workspace: 320,
    dictionary_user: 130,
    cspell_unknown: 220,
    cspell_folder: 219,
    cspell_workspace: 218,
    cspell_user: 120,
    vscode_unknown: 210,
    vscode_folder: 210,
    vscode_workspace: 200,
    vscode_user: 110,
};

type UriString = string;

interface ConfigTargetBase {
    kind: ConfigKind;
    scope: ConfigScope;
    docUri?: UriString;
}

export interface ConfigTargetDictionary extends ConfigTargetBase {
    kind: 'dictionary';
    name: string;
    dictionaryUri: UriString;
}

export interface ConfigTargetCSpell extends ConfigTargetBase {
    kind: 'cspell';
    name: string;
    configUri: UriString;
}

export interface ConfigTargetVSCode extends ConfigTargetBase {
    kind: 'vscode';
    docUri: UriString;
}

export type ConfigTarget = ConfigTargetDictionary | ConfigTargetCSpell | ConfigTargetVSCode;

type ConfigKinds = {
    [key in ConfigKind as `${Capitalize<key>}`]: key;
};

type ConfigScopes = {
    [key in ConfigScope as `${Capitalize<key>}`]: key;
};

type ConfigKindToTarget = {
    [key in ConfigTarget['kind']]: key extends ConfigTargetDictionary['kind']
        ? ConfigTargetDictionary
        : key extends ConfigTargetCSpell['kind']
        ? ConfigTargetCSpell
        : key extends ConfigTargetVSCode['kind']
        ? ConfigTargetVSCode
        : never;
};

export const ConfigKinds: ConfigKinds = {
    Dictionary: 'dictionary',
    Cspell: 'cspell',
    Vscode: 'vscode',
};

export const ConfigScopes: ConfigScopes = {
    Unknown: 'unknown',
    User: 'user',
    Workspace: 'workspace',
    Folder: 'folder',
};

function isA<T extends ConfigTarget>(kind: T['kind']) {
    return (t: T | ConfigTarget): t is T => typeof t === 'object' && t.kind === kind;
}

export function isConfigTargetOfKind<K extends ConfigKind>(t: ConfigKindToTarget[K] | ConfigTarget, kind: K): t is ConfigKindToTarget[K] {
    return typeof t === 'object' && t.kind === kind;
}

export const isConfigTargetDictionary = isA<ConfigTargetDictionary>(ConfigKinds.Dictionary);
export const isConfigTargetCSpell = isA<ConfigTargetCSpell>(ConfigKinds.Cspell);
export const isConfigTargetVSCode = isA<ConfigTargetVSCode>(ConfigKinds.Vscode);

export function weight(target: ConfigTarget): number {
    return configWeights[toWeightKey(target)];
}

function toWeightKey(target: ConfigTarget): keyof ConfigWeights {
    return `${target.kind}_${target.scope}`;
}
