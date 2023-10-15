export interface WorkspaceFolder {
    readonly uri: string;
    readonly name: string;
    readonly index: number;
}

export interface TextDocument {
    readonly uri: string;
    readonly fileName: string;
    readonly isUntitled: boolean;
    readonly languageId: string;
    readonly name?: string | undefined;
}

export interface Workspace {
    workspaceFolders: WorkspaceFolder[] | undefined;
    name: string | undefined;
    textDocuments: TextDocument[];
}
