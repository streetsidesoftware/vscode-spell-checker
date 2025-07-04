import type {
    ApplyNotificationAPI,
    ApplyRequestAPI,
    ClientAPIDef,
    ClientSideMethods,
    Logger,
    MessageConnection,
    RpcAPI,
    ServerAPIDef,
    ServerSideMethods,
} from 'json-rpc-api';
import { createClientApi, createServerApi } from 'json-rpc-api';

import type {
    RequestResult,
    Settings,
    SetValueRequest,
    SetValueResult,
    TextDocumentRef,
    TodoList,
    UpdateEnabledFileTypesRequest,
    WatchFieldList,
} from './apiModels.js';

/** Requests that can be made to the extension */
export interface ServerRequestsAPI {
    whatTimeIsIt(): string;
    setLogDebug(enable: boolean): boolean;
    getLogDebug(): boolean;
    getTodos(): RequestResult<TodoList>;
    getCurrentDocument(): RequestResult<TextDocumentRef | null>;
    getDocSettings(docUrl?: string): Settings | null;
    updateEnabledFileTypes(request: UpdateEnabledFileTypesRequest): void;
    resetTodos(): SetValueResult<TodoList>;
    setTodos(req: SetValueRequest<TodoList>): SetValueResult<TodoList>;
    watchFields(req: WatchFieldList): void;
}

export interface OpenTextDocumentOptions {
    line?: number;
    column?: number;
}

/** Notifications that can be sent to the extension */
export interface ServerNotificationsAPI {
    showInformationMessage(message: string): void;
    openTextDocument(url: string, options?: OpenTextDocumentOptions): void;
}

/**
 * Requests that can be made from the extension to the webview or webviews
 * Note: RPC requests to the client/webview is rare.
 */
export type ClientRequestsAPI = object;

/** Notifications from the extension to the webview. */
export interface ClientNotificationsAPI {
    onStateChange(change: WatchFieldList): void;
}

export interface SpellInfoWebviewAPI extends RpcAPI {
    serverRequests: ApplyRequestAPI<ServerRequestsAPI>;
    serverNotifications: ApplyNotificationAPI<ServerNotificationsAPI>;
    clientRequests: ApplyRequestAPI<ClientRequestsAPI>;
    clientNotifications: ApplyNotificationAPI<ClientNotificationsAPI>;
}

/**
 * Used on the server side (in the extension) to communicate with the webviews.
 */
export type ServerSideApi = ServerSideMethods<SpellInfoWebviewAPI>;
/**
 * Used in the webviews to communicate with the extension.
 */
export type ClientSideApi = ClientSideMethods<SpellInfoWebviewAPI>;

export type ServerSideApiDef = ServerAPIDef<SpellInfoWebviewAPI>;
export type ClientSideApiDef = ClientAPIDef<SpellInfoWebviewAPI>;

export function createServerSideSpellInfoWebviewApi(
    connection: MessageConnection,
    api: ServerAPIDef<SpellInfoWebviewAPI>,
    logger: Logger | undefined,
): ServerSideApi {
    return createServerApi(connection, api, logger);
}

export function createClientSideSpellInfoWebviewApi(
    connection: MessageConnection,
    api: ClientAPIDef<SpellInfoWebviewAPI>,
    logger: Logger | undefined,
): ClientSideApi {
    return createClientApi(connection, api, logger);
}
