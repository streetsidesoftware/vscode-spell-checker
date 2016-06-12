import {
    IPCMessageReader, IPCMessageWriter,
    createConnection, IConnection,
    TextDocuments, TextDocument,
    InitializeResult,
    InitializeParams
} from 'vscode-languageserver';
import { CancellationToken } from 'vscode-jsonrpc';
import * as Validator from './validator';
import {CSpellSettings} from './CSpellSettings';
import { setUserWords } from './spellChecker';
import * as Rx from 'rx';
import { onCodeActionHandler } from './codeActions';

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

// debounce buffer
const validationRequestStream: Rx.ReplaySubject<TextDocument> = new Rx.ReplaySubject<TextDocument>(1);
const validationFinishedStream: Rx.ReplaySubject<{uri: string; version: number}> = new Rx.ReplaySubject<{uri: string; version: number}>(1);

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
    documents.all().forEach(doc => validationRequestStream.onNext(doc));
});

// validate documents
validationRequestStream
    // .tap(doc => connection.console.log(`A Validate ${doc.uri}:${doc.version}:${Date.now()}`))
    .filter(shouldValidateDocument)
    // .tap(doc => connection.console.log(`B Validate ${doc.uri}:${doc.version}:${Date.now()}`))
    .groupByUntil( doc => doc.uri, doc => doc, () => validationFinishedStream.delay(5))
    .flatMap(group => group.last())
    // .tap(doc => connection.console.log(`C Validate ${doc.uri}:${doc.version}:${Date.now()}`))
    .subscribe(validateTextDocument);

// Clear the diagnostics for documents we do not want to validate
validationRequestStream
    .filter(doc => ! shouldValidateDocument(doc))
    .subscribe(doc => {
        connection.sendDiagnostics({ uri: doc.uri, diagnostics: [] });
    });

validationFinishedStream.onNext({uri: 'start', version: 0});

// validationFinishedStream.subscribe(doc => connection.console.log(`Done:      ${doc.uri}:${doc.version}:${Date.now()}`));

function shouldValidateDocument(textDocument: TextDocument): boolean {
    const { enabledLanguageIds, ignorePaths } = settings;
    const { uri, languageId } = textDocument;
    return enabledLanguageIds.indexOf(languageId) >= 0
        && ignorePaths.reduce((prev: boolean, path: string) => {
            return prev && uri.indexOf(path) < 0;
        }, true);
}

function validateTextDocument(textDocument: TextDocument): void {
    Validator.validateTextDocument(textDocument, settings.maxNumberOfProblems).then(diagnostics => {
        // Send the computed diagnostics to VSCode.
        validationFinishedStream.onNext(textDocument);
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    });
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
    validationRequestStream.onNext(change.document);
});

connection.onCodeAction(onCodeActionHandler(documents));

// Listen on the connection
connection.listen();