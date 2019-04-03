import { Workspace, TextDocument } from './workspace';

export interface Settings {
    dictionaries: DictionaryEntry[];
    configs: Configs;
    knownLanguageIds: string[];
    workspace?: Workspace;
    activeFileUri?: string;
    activeFolderUri?: string;
}

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

