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
    ConfigurationTarget,
    GetConfigurationForDocumentRequest,
    GetConfigurationForDocumentResult,
    IsSpellCheckEnabledResult,
    OnSpellCheckDocumentStep,
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
    spellingSuggestions(req: TextDocumentInfo): SpellingSuggestionsResult;
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
    addWordsToVSCodeSettingsFromServer: (words: string[], documentUri: string, target: ConfigurationTarget) => void;
    addWordsToDictionaryFileFromServer: (words: string[], documentUri: string, dict: { uri: string; name: string }) => void;
    addWordsToConfigFileFromServer: (words: string[], documentUri: string, config: { uri: string; name: string }) => void;
    onWorkspaceConfigForDocumentRequest: (req: WorkspaceConfigForDocumentRequest) => WorkspaceConfigForDocumentResponse;
}

/** Notifications from the server to the client(vscode extension) */
export interface ClientNotificationsAPI {
    onSpellCheckDocument(step: OnSpellCheckDocumentStep): void;
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

export function createServerSideApi(
    connection: MessageConnection,
    api: ServerAPIDef<SpellCheckerServerAPI>,
    logger: Logger | undefined,
): ServerSideApi {
    return createServerApi(connection, api, logger);
}

export function createClientSideApi(
    connection: MessageConnection,
    api: ClientAPIDef<SpellCheckerServerAPI>,
    logger: Logger | undefined,
): ClientSideApi {
    return createClientApi(connection, api, logger);
}

type DefineHandlers<T> = {
    [P in keyof T]: Exclude<T[P], boolean>;
};
