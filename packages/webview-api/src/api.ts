import type {
    ApplyNotificationAPI,
    ApplyRequestAPI,
    ClientAPIDef,
    ClientSideMethods,
    MessageConnection,
    RpcAPI,
    ServerAPIDef,
    ServerSideMethods,
} from 'vscode-webview-rpc';
import { createClientApi, createServerApi } from 'vscode-webview-rpc';

import type { LogLevel, RequestResult, SetValueRequest, SetValueResult, TextDocumentRef, TodoList, WatchFieldList } from './apiModels';

export { setLogLevel } from 'vscode-webview-rpc/logger';

/** Requests that can be made to the extension */
export interface ServerRequestsAPI {
    whatTimeIsIt(): string;
    getLogLevel(): RequestResult<LogLevel>;
    getTodos(): RequestResult<TodoList>;
    getCurrentDocument(): RequestResult<TextDocumentRef | null>;
    resetTodos(): SetValueResult<TodoList>;
    setLogLevel(req: SetValueRequest<LogLevel>): SetValueResult<LogLevel>;
    setTodos(req: SetValueRequest<TodoList>): SetValueResult<TodoList>;
    watchFields(req: WatchFieldList): void;
}

/** Notifications that can be sent to the extension */
export interface ServerNotificationsAPI {
    showInformationMessage(message: string): void;
}

/**
 * Requests that can be made from the extension to the webview or webviews
 * Note: RPC requests to the client/webview is rare.
 */
export interface ClientRequestsAPI {}

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
export interface ServerSideApi extends ServerSideMethods<SpellInfoWebviewAPI> {}
/**
 * Used in the webviews to communicate with the extension.
 */
export interface ClientSideApi extends ClientSideMethods<SpellInfoWebviewAPI> {}

export type ServerSideApiDef = ServerAPIDef<SpellInfoWebviewAPI>;
export type ClientSideApiDef = ClientAPIDef<SpellInfoWebviewAPI>;

export function createServerSideSpellInfoWebviewApi(connection: MessageConnection, api: ServerAPIDef<SpellInfoWebviewAPI>): ServerSideApi {
    return createServerApi(connection, api);
}

export function createClientSideSpellInfoWebviewApi(connection: MessageConnection, api: ClientAPIDef<SpellInfoWebviewAPI>): ClientSideApi {
    return createClientApi(connection, api);
}
