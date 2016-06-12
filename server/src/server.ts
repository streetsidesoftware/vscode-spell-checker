import {
    IPCMessageReader, IPCMessageWriter,
    createConnection, IConnection,
    TextDocuments, TextDocument,
    InitializeResult, Command,
    InitializeParams, CodeActionParams
} from 'vscode-languageserver';
import * as LangServer from 'vscode-languageserver';
import { CancellationToken } from 'vscode-jsonrpc';
import * as Validator from './validator';
import {CSpellSettings} from './CSpellSettings';
import { setUserWords, suggest } from './spellChecker';
import * as Text from './util/text';
import * as Rx from 'rx';

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

const debounce = 200;

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

function extractText(textDocument: TextDocument, range: LangServer.Range) {
    const { start, end } = range;
    const offStart = textDocument.offsetAt(start);
    const offEnd = textDocument.offsetAt(end);
    return textDocument.getText().slice(offStart, offEnd);
}

connection.onCodeAction((params: CodeActionParams) => {
    const startTime = Date.now();
    const commands: Command[] = [];
    const { context, textDocument: { uri } } = params;
    const { diagnostics } = context;
    const textDocument = documents.get(uri);

    function replaceText(range: LangServer.Range, text) {
        return LangServer.TextEdit.replace(range, text || '');
    }

    function genMultiWordSugs(words: string[]): string[] {
        const snakeCase = words.join('_').toLowerCase();
        const camelCase = Text.snakeToCamel(snakeCase);
        return [
            snakeCase,
            Text.ucFirst(camelCase),
            Text.lcFirst(camelCase)
        ];
    }

    for (const diag of diagnostics) {
        const word = extractText(textDocument, diag.range);
        const sugs: string[] = suggest(word);
        sugs
            .map(sug => Text.matchCase(word, sug))
            .forEach(sugWord => {
                commands.unshift(LangServer.Command.create(sugWord, 'cSpell.editText',
                    uri,
                    textDocument.version,
                    [ replaceText(diag.range, sugWord) ]
                ));
                const words = sugWord.replace(/[ \-_.]/, '_').split('_');
                if (words.length > 1) {
                    if (Text.isUpperCase(word)) {
                        const sug = words.join('_').toUpperCase();
                        commands.unshift(LangServer.Command.create(sug, 'cSpell.editText',
                            uri,
                            textDocument.version,
                            [ replaceText(diag.range, sug) ]
                        ));
                    } else {
                        genMultiWordSugs(words).forEach(sugWord => {
                            commands.unshift(LangServer.Command.create(sugWord, 'cSpell.editText',
                                uri,
                                textDocument.version,
                                [ replaceText(diag.range, sugWord) ]
                            ));
                        });
                    }
                }
            });
    }
    /*
    commands.push(LangServer.Command.create(
        'Add: ' + extractText(textDocument, params.range) + ' to dictionary',
        'cSpell.editText',
        uri,
        textDocument.version,
        [ replaceText(params.range, 'WORD') ]
    ));
    */
    const diffTime = Date.now() - startTime;
    // connection.console.log(`Suggestions Calculated in : ${diffTime}ms`);
    return commands;
});

// Listen on the connection
connection.listen();