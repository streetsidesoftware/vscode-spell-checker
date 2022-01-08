import { Connection } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { createProgressNotifier } from './progressNotifier';
import { createClientApi } from './clientApi';

jest.mock('./clientApi');

const mockedCreateClientApi = jest.mocked(createClientApi);
// const mockedCreateConnection = jest.mocked(createConnection);

mockedCreateClientApi.mockImplementation(() => {
    return {
        sendOnSpellCheckDocument: jest.fn(),
        sendOnWorkspaceConfigForDocumentRequest: jest.fn(),
    };
});

const stub: any = {};
const connection = stub as Connection;

describe('Validate Progress Notifier', () => {
    test('createProgressNotifier', async () => {
        const clientApi = createClientApi(connection);
        const notifier = createProgressNotifier(clientApi);
        const mockSendOnSpellCheckDocument = jest.mocked(clientApi.sendOnSpellCheckDocument);

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
            })
        );
    });
});
