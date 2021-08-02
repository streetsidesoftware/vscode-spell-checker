import { Workspace, TextDocument } from './workspace';

export interface Settings {
    dictionaries: DictionaryEntry[];
    configs: Configs;
    knownLanguageIds: string[];
    workspace?: Workspace;
    activeFileUri?: string;
    activeFolderUri?: string;
}

export type LocaleId = string;
export type LocaleList = LocaleId[];

export type FileType = string;
export type FileTypeList = FileType[];

export type FileUri = string;

export type ConfigTarget = keyof SettingByConfigTarget<void>;
export type ConfigSource = ConfigTarget | 'default';

export type Inherited<T> = T;

export interface SettingByConfigTarget<T> {
    user: T;
    workspace: T;
    folder: T;
}

export interface Configs extends SettingByConfigTarget<Config> {
    file: FileConfig | undefined;
}

export interface DictionaryEntry {
    name: string;
    locales: LocaleList;
    languageIds: FileTypeList;
    description?: string;
}

export interface Config {
    inherited: { [key in keyof Config]?: ConfigSource };
    locales: Inherited<LocaleList>;
    languageIdsEnabled: Inherited<FileTypeList>;
}

export interface FileConfig extends TextDocument {
    languageEnabled: boolean | undefined;
    fileEnabled: boolean | undefined;
    dictionaries: DictionaryEntry[];
    configFiles: ConfigFile[];
}

export interface ConfigFile {
    uri: FileUri;
    name: string;
}
