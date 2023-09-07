import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Connection } from 'vscode-languageserver';

import type { OnSpellCheckDocumentStep, WorkspaceConfigForDocumentRequest } from './api.js';
import { createClientApi } from './clientApi.mjs';

const stub: any = {
    sendNotification: vi.fn(),
    sendRequest: vi.fn(),
};
const connection = stub as Connection;

const mockConnection = vi.mocked(connection);

describe('Validate Client Api', () => {
    beforeEach(() => {
        mockConnection.sendNotification.mockClear();
        mockConnection.sendRequest.mockClear();
    });

    test('sendOnSpellCheckDocument', () => {
        const api = createClientApi(connection);
        const p: OnSpellCheckDocumentStep = {
            uri: 'uri',
            seq: 1,
            step: 'step',
            ts: 1,
            version: 1,
        };
        api.sendOnSpellCheckDocument(p);
        expect(mockConnection.sendNotification).toHaveBeenLastCalledWith(
            expect.objectContaining({
                method: 'onSpellCheckDocument',
                numberOfParams: 1,
            }),
            p,
        );
    });

    test('sendOnWorkspaceConfigForDocumentRequest', () => {
        const api = createClientApi(connection);
        const req: WorkspaceConfigForDocumentRequest = {
            uri: 'uri',
        };
        api.sendOnWorkspaceConfigForDocumentRequest(req);
        expect(mockConnection.sendRequest).toHaveBeenLastCalledWith(
            expect.objectContaining({
                method: 'onWorkspaceConfigForDocumentRequest',
                numberOfParams: 1,
            }),
            req,
        );
    });
});
