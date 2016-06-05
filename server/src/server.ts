import {
    IPCMessageReader, IPCMessageWriter,
    createConnection, IConnection,
    TextDocuments, TextDocument,
    InitializeResult, TextEdit, Command,
    InitializeParams
} from 'vscode-languageserver';
import { CancellationToken } from 'vscode-jsonrpc';
import * as Validator from './validator';
import {CSpellSettings} from './CSpellSettings';
import { setUserWords } from './spellChecker';

const settings: CSpellSettings = {
    enabledLanguageIds: [
        'csharp', 'go', 'javascript', 'javascriptreact', 'markdown',
        'php', 'plaintext', 'text', 'typescript', 'typescriptreact'
    ],
    maxNumberOfProblems: 100,
    words: [],
    userWords: [],
    ignorePaths: []
};

// Create a connection for the server. The connection uses Node's IPC as a transport
const connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

// Create a simple text document manager. The text document manager
// supports full document sync only
const documents: TextDocuments = new TextDocuments();

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities.
let workspaceRoot: string;
connection.onInitialize((params: InitializeParams, token: CancellationToken): InitializeResult => {
    workspaceRoot = params.rootPath;
    return {
        capabilities: {
            // Tell the client that the server works in FULL text document sync mode
            textDocumentSync: documents.syncKind,
            codeActionProvider: true
        }
    };
});

// The settings interface describe the server relevant settings part
interface Settings {
    cSpell: CSpellSettings;
}

// hold the maxNumberOfProblems setting
// The settings have changed. Is send on server activation
// as well.
connection.onDidChangeConfiguration((change) => {
    const { cSpell = {} } = change.settings;
    Object.assign(settings, cSpell);
    setUserWords(settings.userWords, settings.words);

    // Revalidate any open text documents
    documents.all().forEach(validateTextDocument);
});


function shouldValidateDocument(textDocument: TextDocument): boolean {
    const { enabledLanguageIds, ignorePaths } = settings;
    const { uri, languageId } = textDocument;
    return enabledLanguageIds.indexOf(languageId) >= 0
        && ignorePaths.reduce((prev: boolean, path: string) => {
            return prev && uri.indexOf(path) < 0;
        }, true);
}

function validateTextDocument(textDocument: TextDocument): void {
    if (shouldValidateDocument(textDocument)) {
        Validator.validateTextDocument(textDocument).then(diagnostics => {
            // Send the computed diagnostics to VSCode.
            connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
        });
    } else {
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: [] });
    }
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
    validateTextDocument(change.document);
});

connection.onCodeAction((params) => {
    const commands: Command[] = [];
    return commands;
});

// Listen on the connection
connection.listen();