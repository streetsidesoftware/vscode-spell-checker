import type { ExcludeDisposableHybrid } from 'utils-disposables';
import { injectDisposable } from 'utils-disposables';
import { describe, expect, test, vi } from 'vitest';
import { TextDocument } from 'vscode-languageserver-textdocument';

import type { MessageConnection, ServerSideApi } from './api.js';
import { createProgressNotifier } from './progressNotifier.mjs';
import { createServerApi } from './serverApi.mjs';

vi.mock('./serverApi');

const mockedCreateClientApi = vi.mocked(createServerApi);
// const mockedCreateConnection = jest.mocked(createConnection);

mockedCreateClientApi.mockImplementation(() => {
    const mock: ServerSideApi = injectDisposable<ExcludeDisposableHybrid<ServerSideApi>>(
        {
            clientRequest: {
                onWorkspaceConfigForDocumentRequest: vi.fn(),
            },
            clientNotification: {
                onSpellCheckDocument: vi.fn(),
                onDiagnostics: vi.fn(),
            },
            serverRequest: {
                getConfigurationForDocument: { subscribe: vi.fn() },
                isSpellCheckEnabled: { subscribe: vi.fn() },
                splitTextIntoWords: { subscribe: vi.fn() },
                spellingSuggestions: { subscribe: vi.fn() },
            },
            serverNotification: {
                notifyConfigChange: { subscribe: vi.fn() },
                registerConfigurationFile: { subscribe: vi.fn() },
            },
        },
        () => undefined,
    );
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
