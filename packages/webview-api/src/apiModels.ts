export { Settings } from './models/settings.js';

export interface Todo {
    uuid: number;
    done: boolean;
    text: string;
}

export type UrlString = string;

export type TodoList = Todo[];

export interface TextDocumentRef {
    url: UrlString;
    version: number;
}

export interface AppStateData {
    todos: TodoList;
    logDebug: boolean;
    readonly currentDocument: TextDocumentRef | null;
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

export interface UpdateEnabledFileTypesRequest {
    /**
     * The file types to enable or disable.
     */
    enabledFileTypes: Record<string, boolean>;
    /**
     * The url of the related resource.
     */
    url?: UrlString;
}
