import { Workspace, TextDocument } from './workspace';

export type LocalId = string;
export type LocalList = LocalId[];

export type FileType = string;
export type FileTypeList = FileType[];

export type ConfigTarget = keyof SettingByConfigTarget<void>;

export type Inherited<T> = T;

export interface SettingByConfigTarget<T> {
    user: T;
    workspace: T;
    folder: T;
}

export interface Configs extends SettingByConfigTarget<Config> {
    file: FileConfig | undefined;
};

export interface DictionaryEntry {
    name: string;
    locals: LocalList;
    languageIds: FileTypeList;
    description?: string;
}

export interface Settings {
    dictionaries: DictionaryEntry[];
    configs: Configs;
    workspace?: Workspace;
    activeFileUri?: string;
    activeFolderUri?: string;
}

export interface Config {
    inherited: { [key in keyof Config]?: ConfigTarget };
    locals: Inherited<LocalList>;
    languageIdsEnabled: Inherited<FileTypeList>;
}

export interface FileConfig extends TextDocument {
    languageEnabled: boolean | undefined;
    fileEnabled: boolean | undefined;
    dictionaries: DictionaryEntry[];
}

export const ConfigTargets = Object.freeze<SettingByConfigTarget<ConfigTarget>>({
    user: 'user',
    workspace: 'workspace',
    folder: 'folder',
});

export const configTargets = Object.freeze(Object.keys(ConfigTargets) as ConfigTarget[]);

const setOfConfigTargets = new Set<string>(configTargets);

export function isConfigTarget(target: string | undefined): target is ConfigTarget {
    return target !== undefined && setOfConfigTargets.has(target);
}

// Define the order in which configuration is applied.
export const configTargetToIndex = Object.freeze<SettingByConfigTarget<number>>({
    user: 0,
    workspace: 1,
    folder: 2,
});


export const configTargetOrder = Object.freeze(Object.entries(configTargetToIndex).sort((a, b) => a[1] - b[1]).map(a => a[0]) as ConfigTarget[]);

/*
locals
filetypes

*/

