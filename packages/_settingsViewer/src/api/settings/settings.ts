
export type LocalList = string[];

export interface LocalSetting {
    user: LocalList;
    workspace: LocalList;
    folder: LocalList;
    file: LocalList;
}

export interface LocalInfo {
    code: string;
    name: string;
    dictionaries: string[];
    enabled?: boolean;
    isInUserSettings?: boolean;
    isInWorkspaceSettings?: boolean;
    isInFolderSettings?: boolean;
}

export interface Settings {
    locals: LocalInfo[];
}



