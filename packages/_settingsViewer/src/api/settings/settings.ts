
export type LocalId = string;
export type LocalList = LocalId[];

export type FileType = string;
export type FileTypeList = FileType[];

export type ConfigTarget = keyof SettingByConfigTarget<void>;

export type Inherited<T> = T | undefined;

export interface SettingByConfigTarget<T> {
    user: T;
    workspace: T;
    folder: T;
    file: T;
}

export interface LocalSetting extends SettingByConfigTarget<LocalList | undefined> {}

export interface Configs extends SettingByConfigTarget<Config | undefined> {};

export interface DictionaryEntry {
    name: string;
    locals: LocalList;
    fileTypes: FileTypeList;
    description?: string;
}

export interface Settings {
    locals: LocalSetting;
    dictionaries: DictionaryEntry[];
    configs: Configs;
}

export interface Config {
    locals: Inherited<LocalList>;
    fileTypesEnabled: Inherited<FileTypeList>;
}

const targetConst = Object.freeze<SettingByConfigTarget<ConfigTarget>>({
    user: 'user',
    workspace: 'workspace',
    folder: 'folder',
    file: 'file',
});

export const configTargets = Object.freeze(Object.keys(targetConst) as ConfigTarget[]);

const setOfConfigTargets = new Set<string>(configTargets);

export function isConfigTarget(target: string | undefined): target is ConfigTarget {
    return target !== undefined && setOfConfigTargets.has(target);
}

/*
locals
filetypes

*/

