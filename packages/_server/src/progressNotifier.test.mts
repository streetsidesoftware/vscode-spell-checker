import { describe, expect, test, vi } from 'vitest';
import { TextDocument } from 'vscode-languageserver-textdocument';

import type { MessageConnection, ServerSideApi } from './api.js';
import { createProgressNotifier } from './progressNotifier.mjs';
import { createServerApi } from './serverApi.mjs';
import { createMockServerSideApi } from './test/test.api.js';

vi.mock('./serverApi');

const mockedCreateClientApi = vi.mocked(createServerApi);
// const mockedCreateConnection = jest.mocked(createConnection);

mockedCreateClientApi.mockImplementation(() => {
    const mock: ServerSideApi = createMockServerSideApi();
    return mock;
});

const connection: MessageConnection = {
    onNotification: vi.fn(),
    onRequest: vi.fn(),
    sendNotification: vi.fn(),
    sendRequest: vi.fn((() => Promise.resolve(undefined)) as () => any),
};

// const mockConnection = vi.mocked(connection);

const logger = {
    log: vi.fn(),
};

describe('Validate Progress Notifier', () => {
    test('createProgressNotifier', async () => {
        const clientApi = createServerApi(connection, {}, logger);
        const notifier = createProgressNotifier(clientApi);
        const mockSendOnSpellCheckDocument = vi.mocked(clientApi.clientNotification.onSpellCheckDocument);

        expect(notifier.emitSpellCheckDocumentStep).toBeDefined();

        const doc = TextDocument.create('file:///doc.txt', 'plaintext', 1, 'Some text');
        await notifier.emitSpellCheckDocumentStep(doc, 'test 1');
        expect(mockSendOnSpellCheckDocument).toBeCalledWith(
            expect.objectContaining({
                done: false,
                numIssues: undefined,
                // seq: 1,
                step: 'test 1',
                // ts: 1626082854948,
                uri: 'file:///doc.txt',
                version: 1,
            }),
        );
    });
});
