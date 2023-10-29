import type {
    ApiPrefix,
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
    GetConfigurationForDocumentRequest,
    GetConfigurationForDocumentResult,
    IsSpellCheckEnabledResult,
    OnSpellCheckDocumentStep,
    PublishDiagnostics,
    SpellingSuggestionsResult,
    SplitTextIntoWordsResult,
    TextDocumentInfo,
    WorkspaceConfigForDocumentRequest,
    WorkspaceConfigForDocumentResponse,
} from './apiModels.js';

export type { Logger, MessageConnection } from 'json-rpc-api';

/** Requests that can be made to the server */
export interface ServerRequestsAPI {
    getConfigurationForDocument(req: GetConfigurationForDocumentRequest): GetConfigurationForDocumentResult;
    isSpellCheckEnabled(req: TextDocumentInfo): IsSpellCheckEnabledResult;
    splitTextIntoWords(req: string): SplitTextIntoWordsResult;
    spellingSuggestions(word: string, doc?: TextDocumentInfo): SpellingSuggestionsResult;
}

/** Notifications that can be sent to the server */
export interface ServerNotificationsAPI {
    notifyConfigChange: () => void;
    registerConfigurationFile: (path: string) => void;
}

/**
 * Requests that can be made from the server to the client(vscode extension)
 * Note: RPC requests to the client/extension is rare.
 */
export interface ClientRequestsAPI {
    onWorkspaceConfigForDocumentRequest: (req: WorkspaceConfigForDocumentRequest) => WorkspaceConfigForDocumentResponse;
}

/** Notifications from the server to the client(vscode extension) */
export interface ClientNotificationsAPI {
    onSpellCheckDocument(step: OnSpellCheckDocumentStep): void;
    onDiagnostics(pub: PublishDiagnostics): void;
}

export interface SpellCheckerServerAPI extends RpcAPI {
    serverRequests: ApplyRequestAPI<ServerRequestsAPI>;
    serverNotifications: ApplyNotificationAPI<ServerNotificationsAPI>;
    clientRequests: ApplyRequestAPI<ClientRequestsAPI>;
    clientNotifications: ApplyNotificationAPI<ClientNotificationsAPI>;
}

/**
 * Used on the server side  to communicate with the client(extension).
 */
export interface ServerSideApi extends ServerSideMethods<SpellCheckerServerAPI> {}
/**
 * Used in the client(extension) to communicate with the server.
 */
export interface ClientSideApi extends ClientSideMethods<SpellCheckerServerAPI> {}

export type ServerSideApiDef = ServerAPIDef<SpellCheckerServerAPI>;
export type ClientSideApiDef = ClientAPIDef<SpellCheckerServerAPI>;

export interface ServerSideHandlers {
    serverRequests: DefineHandlers<ServerSideApiDef['serverRequests']>;
    serverNotifications: DefineHandlers<ServerSideApiDef['serverNotifications']>;
}

// todo: make '' when all old apis are removed.
const pfx = '_';

const apiPrefix: ApiPrefix = {
    serverNotifications: pfx,
    serverRequests: pfx,
    clientNotifications: pfx,
    clientRequests: pfx,
};

export function createServerSideApi(
    connection: MessageConnection,
    api: ServerAPIDef<SpellCheckerServerAPI>,
    logger: Logger | undefined,
): ServerSideApi {
    return createServerApi(connection, api, logger, apiPrefix);
}

export function createClientSideApi(
    connection: MessageConnection,
    api: ClientAPIDef<SpellCheckerServerAPI>,
    logger: Logger | undefined,
): ClientSideApi {
    return createClientApi(connection, api, logger, apiPrefix);
}

type DefineHandlers<T> = {
    [P in keyof T]: Exclude<T[P], boolean>;
};
