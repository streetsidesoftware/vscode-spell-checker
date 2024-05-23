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
    CheckDocumentOptions,
    CheckDocumentResult,
    ConfigurationFields,
    GetConfigurationForDocumentRequest,
    GetConfigurationForDocumentResult,
    GetConfigurationTargetsRequest,
    GetConfigurationTargetsResult,
    GetSpellCheckingOffsetsResult,
    IsSpellCheckEnabledResult,
    OnDocumentConfigChange,
    OnSpellCheckDocumentStep,
    PublishDiagnostics,
    SpellingSuggestionsResult,
    SplitTextIntoWordsResult,
    TextDocumentInfo,
    TextDocumentRef,
    TraceWordRequest,
    TraceWordResult,
    WorkspaceConfigForDocumentRequest,
    WorkspaceConfigForDocumentResponse,
} from './apiModels.js';
import type { VfsFileSystem } from './models/vfs.mjs';

export type { Logger, MessageConnection } from 'json-rpc-api';

/** Requests that can be made to the server */
export interface ServerRequestsAPI {
    getConfigurationForDocument<Fields extends ConfigurationFields>(
        req: GetConfigurationForDocumentRequest<Fields>,
    ): GetConfigurationForDocumentResult<Fields>;
    getConfigurationTargets(req: GetConfigurationTargetsRequest): GetConfigurationTargetsResult;
    isSpellCheckEnabled(req: TextDocumentInfo): IsSpellCheckEnabledResult;
    splitTextIntoWords(req: string): SplitTextIntoWordsResult;
    spellingSuggestions(word: string, doc?: TextDocumentInfo): SpellingSuggestionsResult;
    /**
     * Calculate the text ranges that should be spell checked.
     * @param doc The document to be spell checked.
     */
    getSpellCheckingOffsets(doc: TextDocumentRef): GetSpellCheckingOffsetsResult;
    traceWord(req: TraceWordRequest): TraceWordResult;
    checkDocument(doc: TextDocumentInfo, options?: CheckDocumentOptions): CheckDocumentResult;
}

/** Notifications that can be sent to the server */
export interface ServerNotificationsAPI {
    /**
     * Tell the server that the configuration has changed. Causes the server to reload the configuration and
     * check all documents.
     * @returns void
     */
    notifyConfigChange: () => void;
    /**
     * Register a configuration file to be loaded.
     * This is how to add a configuration file to the spell checker. It is mainly used to add language dictionaries.
     * @param url - The url of the configuration file.
     * @returns void
     */
    registerConfigurationFile: (url: string) => void;
}

/**
 * Requests that can be made from the server to the client(vscode extension)
 * Note: RPC requests to the client/extension is rare.
 */
export interface ClientRequestsAPI {
    onWorkspaceConfigForDocumentRequest: (req: WorkspaceConfigForDocumentRequest) => WorkspaceConfigForDocumentResponse;
    vfsReadFile: VfsFileSystem['readFile'];
    vfsStat: VfsFileSystem['stat'];
    vfsReadDirectory: VfsFileSystem['readDirectory'];
}

/** Notifications from the server to the client(vscode extension) */
export interface ClientNotificationsAPI {
    /**
     * Notify the client that the document is being spell checked.
     * @param step - The step in the spell checking process.
     */
    onSpellCheckDocument(step: OnSpellCheckDocumentStep): void;
    /**
     * Send updated document diagnostics to the client.
     * @param pub - The diagnostics to publish.
     */
    onDiagnostics(pub: PublishDiagnostics): void;

    /**
     * Notify the client that the configuration has for the listed document URIs.
     * @param notification - The notification.
     */
    onDocumentConfigChange(notification: OnDocumentConfigChange): void;
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
export type ServerSideApi = ServerSideMethods<SpellCheckerServerAPI>;
/**
 * Used in the client(extension) to communicate with the server.
 */
export type ClientSideApi = ClientSideMethods<SpellCheckerServerAPI>;

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

export type { FileContent, FileStat } from './models/vfs.mjs';
export { FileType } from './models/vfs.mjs';

type DefineHandlers<T> = {
    [P in keyof T]: Exclude<T[P], boolean>;
};
