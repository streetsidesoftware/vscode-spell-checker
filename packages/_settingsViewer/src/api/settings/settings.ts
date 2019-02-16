
export type LocalId = string;

export type LocalList = LocalId[];

export interface LocalSetting {
    user: LocalList;
    workspace: LocalList | undefined;
    folder: LocalList | undefined;
    file: LocalList;
}

export interface DictionaryEntry {
    name: string;
    locals: LocalList;
    description?: string;
}

export interface Settings {
    locals: LocalSetting;
    dictionaries: DictionaryEntry[];
}

