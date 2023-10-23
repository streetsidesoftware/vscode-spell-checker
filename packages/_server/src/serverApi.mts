import type { Logger, MessageConnection, ServerSideApi, ServerSideApiDef, ServerSideHandlers } from './api.js';
import { createServerSideApi } from './api.js';

export type { ServerSideHandlers } from './api.js';

export type PartialServerSideHandlers = PartialPartial<ServerSideHandlers>;

export function createServerApi(connection: MessageConnection, handlers: PartialServerSideHandlers, logger: Logger): ServerSideApi {
    const api: ServerSideApiDef = {
        serverRequests: {
            getConfigurationForDocument: true,
            isSpellCheckEnabled: true,
            splitTextIntoWords: true,
            spellingSuggestions: true,
            ...handlers.serverRequests,
        },
        serverNotifications: {
            notifyConfigChange: true,
            registerConfigurationFile: true,
            ...handlers.serverNotifications,
        },
        clientRequests: {
            onWorkspaceConfigForDocumentRequest: true,
        },
        clientNotifications: {
            onSpellCheckDocument: true,
            onDiagnostics: true,
        },
    };
    return createServerSideApi(connection, api, logger);
}

export type PartialPartial<T> = {
    [K in keyof T]?: Partial<T[K]>;
};
