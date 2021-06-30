// import type * as vscode from 'vscode';

export enum EndOfLine {
    LF = 1,
    CRLF = 2,
}

export enum EnvironmentVariableMutatorType {
    Replace = 1,
    Append = 2,
    Prepend = 3,
}

export const enum FileEditType {
    File = 1,
    Text = 2,
    Cell = 3,
    CellReplace = 5,
}
