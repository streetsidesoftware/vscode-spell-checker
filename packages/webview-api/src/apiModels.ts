import type { LogLevel } from 'vscode-webview-rpc';

import type { Settings } from './models/settings';

export { Settings } from './models/settings';
export { LogLevel } from 'vscode-webview-rpc';

export interface Todo {
    uuid: number;
    done: boolean;
    text: string;
}

export type TodoList = Todo[];

export interface TextDocumentRef {
    url: string;
    version: number;
}

export interface AppStateData {
    todos: TodoList;
    logLevel: LogLevel;
    readonly currentDocument: TextDocumentRef | null;
    readonly docSettings: Settings | null;
}

export type WatchFields = keyof AppStateData;
export type WatchFieldList = WatchFields[];

export interface RequestResult<T> {
    /** sequence number to use for future set requests. */
    seq: number;
    /** the current value */
    value: T;
}

export interface SetValueRequest<T> {
    /** Use the sequence number to ensure it is the right version to update. */
    seq?: number | undefined;
    value: T;
}

export interface SetValueResult<T> extends RequestResult<T> {
    /** was it successful? */
    success: boolean;
}
