import {
    IPCMessageReader, IPCMessageWriter,
    createConnection, IConnection,
    TextDocuments, TextDocument,
    InitializeResult
} from 'vscode-languageserver';
import * as Validator from './validator';

// Create a connection for the server. The connection uses Node's IPC as a transport
const connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

// Create a simple text document manager. The text document manager
// supports full document sync only
const documents: TextDocuments = new TextDocuments();

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities.
let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
    workspaceRoot = params.rootPath;
    return {
        capabilities: {
            // Tell the client that the server works in FULL text document sync mode
            textDocumentSync: documents.syncKind
        }
    };
});

// The settings interface describe the server relevant settings part
interface Settings {
    spellChecker: SpellSettings;
}

// These are the example settings we defined in the client's package.json
// file
interface SpellSettings {
    maxNumberOfProblems: number;
}

// hold the maxNumberOfProblems setting
// The settings have changed. Is send on server activation
// as well.
connection.onDidChangeConfiguration((change) => {
    // Revalidate any open text documents
    documents.all().forEach(validateTextDocument);
});

function validateTextDocument(textDocument: TextDocument): void {
    Validator.validateTextDocument(textDocument).then(diagnostics => {
        // Send the computed diagnostics to VSCode.
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    });
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
    validateTextDocument(change.document);
});


// Listen on the connection
connection.listen();