
export type LocalId = string;

export type LocalList = LocalId[];

export type ConfigTarget = keyof SettingByConfigTarget<void>;

export interface SettingByConfigTarget<T> {
    user: T;
    workspace: T;
    folder: T;
    file: T;
}

export interface LocalSetting extends SettingByConfigTarget<LocalList | undefined> {}

export interface DictionaryEntry {
    name: string;
    locals: LocalList;
    description?: string;
}

export interface Settings {
    locals: LocalSetting;
    dictionaries: DictionaryEntry[];
}

