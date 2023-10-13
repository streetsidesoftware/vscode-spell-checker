import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { MessageConnection, OnSpellCheckDocumentStep, WorkspaceConfigForDocumentRequest } from './api.js';
import { createServerApi } from './serverApi.mjs';
import { mockHandlers } from './test/test.api.js';

const connection: MessageConnection = {
    onNotification: vi.fn(),
    onRequest: vi.fn(),
    sendNotification: vi.fn(),
    sendRequest: vi.fn((() => Promise.resolve(undefined)) as () => any),
};

const mockConnection = vi.mocked(connection);

const logger = {
    log: vi.fn(),
};

describe('Validate Client Api', () => {
    beforeEach(() => {
        mockConnection.sendNotification.mockClear();
        mockConnection.sendRequest.mockClear();
    });

    test('sendOnSpellCheckDocument', () => {
        const handlers = mockHandlers();
        const api = createServerApi(connection, handlers, logger);
        const p: OnSpellCheckDocumentStep = {
            uri: 'uri',
            seq: 1,
            step: 'step',
            ts: 1,
            version: 1,
        };
        api.clientNotification.onSpellCheckDocument(p);
        expect(mockConnection.sendNotification).toHaveBeenLastCalledWith(expect.stringContaining('onSpellCheckDocument'), [p]);
    });

    test('sendOnWorkspaceConfigForDocumentRequest', () => {
        const handlers = mockHandlers();
        const api = createServerApi(connection, handlers, logger);
        const req: WorkspaceConfigForDocumentRequest = {
            uri: 'uri',
        };
        api.clientRequest.onWorkspaceConfigForDocumentRequest(req);
        expect(mockConnection.sendRequest).toHaveBeenLastCalledWith(expect.stringContaining('onWorkspaceConfigForDocumentRequest'), [req]);
    });
});
