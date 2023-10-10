import type { Logger, MessageConnection, ServerSideApiDef, ServerSideHandlers } from './api.js';
import { createServerSideApi } from './api.js';

export type { ServerSideHandlers } from './api.js';

export function createServerApi(connection: MessageConnection, handlers: ServerSideHandlers, logger: Logger) {
    const api: ServerSideApiDef = {
        ...handlers,
        clientRequests: {
            addWordsToConfigFileFromServer: true,
            addWordsToDictionaryFileFromServer: true,
            addWordsToVSCodeSettingsFromServer: true,
            onWorkspaceConfigForDocumentRequest: true,
        },
        clientNotifications: {
            onSpellCheckDocument: true,
        },
    };
    return createServerSideApi(connection, api, logger);
}
