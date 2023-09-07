import { describe, expect, test, vi } from 'vitest';
import type { Connection } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { createClientApi } from './clientApi.mjs';
import { createProgressNotifier } from './progressNotifier.mjs';

vi.mock('./clientApi');

const mockedCreateClientApi = vi.mocked(createClientApi);
// const mockedCreateConnection = jest.mocked(createConnection);

mockedCreateClientApi.mockImplementation(() => {
    return {
        sendOnSpellCheckDocument: vi.fn(),
        sendOnWorkspaceConfigForDocumentRequest: vi.fn(),
    };
});

const stub: any = {};
const connection = stub as Connection;

describe('Validate Progress Notifier', () => {
    test('createProgressNotifier', async () => {
        const clientApi = createClientApi(connection);
        const notifier = createProgressNotifier(clientApi);
        const mockSendOnSpellCheckDocument = vi.mocked(clientApi.sendOnSpellCheckDocument);

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
