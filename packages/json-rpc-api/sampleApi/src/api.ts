import type {
    ApplyNotificationAPI,
    ApplyRequestAPI,
    ClientAPIDef,
    ClientSideMethods,
    MessageConnection,
    RpcAPI,
    ServerAPIDef,
    ServerSideMethods,
} from '../../src/index.js';
import { createClientApi, createServerApi } from '../../src/index.js';
import type { DateString, Todo, TodoList } from './models.js';

/** Requests that can be made to the server */
export interface ServerRequestsAPI {
    whatTimeIsIt(): DateString;
    getTodos(): TodoList;
    addTodos(todo: Todo): TodoList;
    updateTodo(todo: Todo): TodoList;
}

/** Notifications that can be sent to the server */
export interface ServerNotificationsAPI {
    todoOpened(todo: Todo): void;
}

/**
 * Requests that can be made from the server to the client
 * Note: RPC requests to the client is rare.
 */
export interface ClientRequestsAPI {}

/** Notifications from the server to the client. */
export interface ClientNotificationsAPI {
    todoUpdated(todo: Todo): void;
}

export interface TodoAPI extends RpcAPI {
    serverRequests: ApplyRequestAPI<ServerRequestsAPI>;
    serverNotifications: ApplyNotificationAPI<ServerNotificationsAPI>;
    clientRequests: ApplyRequestAPI<ClientRequestsAPI>;
    clientNotifications: ApplyNotificationAPI<ClientNotificationsAPI>;
}

/**
 * Used on the server side (in the extension) to communicate with the webviews.
 */
export interface ServerSideApi extends ServerSideMethods<TodoAPI> {}
/**
 * Used in the webviews to communicate with the extension.
 */
export interface ClientSideApi extends ClientSideMethods<TodoAPI> {}

export type ServerSideApiDef = ServerAPIDef<TodoAPI>;
export type ClientSideApiDef = ClientAPIDef<TodoAPI>;

export function createServerSideTodoApi(connection: MessageConnection, api: ServerAPIDef<TodoAPI>): ServerSideApi {
    return createServerApi(connection, api);
}

export function createClientSideTodoApi(connection: MessageConnection, api: ClientAPIDef<TodoAPI>): ClientSideApi {
    return createClientApi(connection, api);
}
