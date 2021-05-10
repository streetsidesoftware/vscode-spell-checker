// cSpell:ignore pycache

import {
    createConnection,
    TextDocuments,
    Disposable,
    InitializeResult,
    InitializeParams,
    ServerCapabilities,
    CodeActionKind,
    TextDocumentSyncKind,
    ProposedFeatures,
    DidChangeConfigurationParams,
    PublishDiagnosticsParams,
    Diagnostic,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocumentUri, TextDocumentUriLangId } from './config/vscode.config';
import * as Validator from './validator';
import { ReplaySubject, Subscription, timer } from 'rxjs';
import { filter, tap, debounce, debounceTime, flatMap, take } from 'rxjs/operators';
import { onCodeActionHandler } from './codeActions';
import { Glob, Text } from 'cspell-lib';

import * as CSpell from 'cspell-lib';
import { CSpellUserSettings } from './config/cspellConfig';
import { getDefaultSettings, refreshDictionaryCache, extractImportErrors } from 'cspell-lib';
import * as Api from './api';
import {
    correctBadSettings,
    DocumentSettings,
    isUriAllowed,
    isUriBlackListed,
    SettingsCspell,
    stringifyPatterns,
} from './config/documentSettings';
import { log, logError, logger, logInfo, LogLevel, setWorkspaceBase, setWorkspaceFolders } from './utils/log';
import { PatternMatcher, MatchResult, RegExpMatches } from './PatternMatcher';
import { DictionaryWatcher } from './config/dictionaryWatcher';
import { ConfigWatcher } from './config/configWatcher';

log('Starting Spell Checker Server');

type RequestResult<T> = T | Promise<T>;

type RequestMethodApi = {
    [key in keyof Api.ServerMethodRequestResult]: (
        param: Api.ServerRequestMethodRequests[key]
    ) => RequestResult<Api.ServerRequestMethodResults[key]>;
};

const notifyMethodNames: Api.NotifyServerMethodConstants = {
    onConfigChange: 'onConfigChange',
    registerConfigurationFile: 'registerConfigurationFile',
};

const tds = CSpell;

const defaultCheckLimit = Validator.defaultCheckLimit;

const overRideDefaults: CSpellUserSettings = {
    id: 'Extension overrides',
    patterns: [],
    ignoreRegExpList: [],
};

// Turn off the spell checker by default. The setting files should have it set.
// This prevents the spell checker from running too soon.
const defaultSettings: CSpellUserSettings = {
    ...CSpell.mergeSettings(getDefaultSettings(), CSpell.getGlobalSettings(), overRideDefaults),
    checkLimit: defaultCheckLimit,
    enabled: false,
};
const defaultDebounceMs = 50;
// Refresh the dictionary cache every 1000ms.
const dictionaryRefreshRateMs = 1000;

export function run(): void {
    // debounce buffer
    const validationRequestStream = new ReplaySubject<TextDocument>(1);
    const triggerUpdateConfig = new ReplaySubject<void>(1);
    const triggerValidateAll = new ReplaySubject<void>(1);
    const validationByDoc = new Map<string, Subscription>();
    const blockValidation = new Map<string, number>();
    let isValidationBusy = false;
    const disposables: Disposable[] = [];
    const dictionaryWatcher = new DictionaryWatcher();
    disposables.push(dictionaryWatcher);

    const configWatcher = new ConfigWatcher();
    disposables.push(configWatcher);

    const requestMethodApi: RequestMethodApi = {
        isSpellCheckEnabled: handleIsSpellCheckEnabled,
        getConfigurationForDocument: handleGetConfigurationForDocument,
        splitTextIntoWords: handleSplitTextIntoWords,
        spellingSuggestions: handleSpellingSuggestions,
        matchPatternsInDocument: handleMatchPatternsInDocument,
    };

    // Create a connection for the server. The connection uses Node's IPC as a transport
    log('Create Connection');
    const connection = createConnection(ProposedFeatures.all);

    const documentSettings = new DocumentSettings(connection, defaultSettings);

    // Create a simple text document manager.
    const documents = new TextDocuments(TextDocument);

    const patternMatcher = new PatternMatcher();

    connection.onInitialize(
        (params: InitializeParams): InitializeResult => {
            // Hook up the logger to the connection.
            log('onInitialize');
            setWorkspaceBase(params.rootUri ? params.rootUri : '');
            const capabilities: ServerCapabilities = {
                // Tell the client that the server works in FULL text document sync mode
                textDocumentSync: {
                    openClose: true,
                    change: TextDocumentSyncKind.Incremental,
                    willSave: true,
                    save: { includeText: true },
                },
                codeActionProvider: {
                    codeActionKinds: [CodeActionKind.QuickFix],
                },
            };
            return { capabilities };
        }
    );

    // The settings have changed. Is sent on server activation as well.
    connection.onDidChangeConfiguration(onConfigChange);

    interface OnChangeParam extends DidChangeConfigurationParams {
        settings: SettingsCspell;
    }

    function onDictionaryChange(eventType?: string, filename?: string) {
        logInfo(`Dictionary Change ${eventType}`, filename);
        triggerUpdateConfig.next(undefined);
    }

    function onConfigFileChange(eventType?: string, filename?: string) {
        logInfo(`Config File Change ${eventType}`, filename);
        handleConfigChange();
    }

    function onConfigChange(_change?: OnChangeParam) {
        logInfo('Configuration Change');
        handleConfigChange();
    }

    function handleConfigChange() {
        triggerUpdateConfig.next(undefined);
        updateLogLevel();
    }

    function updateActiveSettings() {
        log('updateActiveSettings');
        documentSettings.resetSettings();
        dictionaryWatcher.clear();
        triggerValidateAll.next(undefined);
    }

    function getActiveSettings(doc: TextDocumentUri) {
        return getActiveUriSettings(doc.uri);
    }

    function getActiveUriSettings(uri?: string) {
        // Give the dictionaries a chance to refresh if they need to.
        refreshDictionaryCache(dictionaryRefreshRateMs);
        return documentSettings.getUriSettings(uri);
    }

    function registerConfigurationFile(path: string) {
        documentSettings.registerConfigurationFile(path);
        logInfo('Register Configuration File', path);
        triggerUpdateConfig.next(undefined);
    }

    interface TextDocumentInfo {
        uri?: string;
        languageId?: string;
        text?: string;
    }

    // Listen for event messages from the client.
    connection.onNotification(notifyMethodNames.onConfigChange, onConfigChange);
    connection.onNotification(notifyMethodNames.registerConfigurationFile, registerConfigurationFile);
    disposables.push(dictionaryWatcher.listen(onDictionaryChange));
    disposables.push(configWatcher.listen(onConfigFileChange));

    async function handleIsSpellCheckEnabled(params: TextDocumentInfo): Promise<Api.IsSpellCheckEnabledResult> {
        const { uri, languageId } = params;
        const fileEnabled = uri ? !(await isUriExcluded(uri)) : undefined;
        const settings = await getActiveUriSettings(uri);
        const languageEnabled = languageId && uri ? await isLanguageEnabled({ uri, languageId }, settings) : undefined;
        const excludedBy = !fileEnabled && uri ? await getExcludedBy(uri) : undefined;

        return {
            languageEnabled,
            fileEnabled,
            excludedBy,
        };
    }

    async function handleGetConfigurationForDocument(params: TextDocumentInfo): Promise<Api.GetConfigurationForDocumentResult> {
        const { uri, languageId } = params;
        const doc = uri && documents.get(uri);
        const docSettings = stringifyPatterns((doc && (await getSettingsToUseForDocument(doc))) || undefined);
        const settings = stringifyPatterns(await getActiveUriSettings(uri));
        const languageEnabled = languageId && doc ? await isLanguageEnabled(doc, settings) : undefined;
        const configFiles = uri ? (await documentSettings.findCSpellConfigurationFilesForUri(uri)).map((uri) => uri.toString()) : [];

        const fileEnabled = uri ? !(await isUriExcluded(uri)) : undefined;
        const excludedBy = !fileEnabled && uri ? await getExcludedBy(uri) : undefined;
        return {
            languageEnabled,
            fileEnabled,
            settings,
            docSettings,
            excludedBy,
            configFiles,
        };
    }

    async function getExcludedBy(uri: string): Promise<Api.ExcludeRef[]> {
        function globToString(g: Glob): string {
            if (typeof g === 'string') return g;
            return g.glob;
        }
        const ex = await documentSettings.calcExcludedBy(uri);
        return ex.map((ex) => ({
            glob: globToString(ex.glob),
            filename: ex.settings.__importRef?.filename || ex.settings.source?.filename,
            id: ex.settings.id,
            name: ex.settings.name,
        }));
    }

    function textToWords(text: string): string[] {
        const setOfWords = new Set(
            Text.extractWordsFromCode(text)
                .map((t) => t.text)
                .map((t) => t.toLowerCase())
        );
        return [...setOfWords];
    }

    function handleSplitTextIntoWords(text: string): Api.SplitTextIntoWordsResult {
        return {
            words: textToWords(text),
        };
    }

    async function handleSpellingSuggestions(_params: TextDocumentInfo): Promise<Api.SpellingSuggestionsResult> {
        return {};
    }

    async function handleMatchPatternsInDocument(params: Api.MatchPatternsToDocumentRequest): Promise<Api.MatchPatternsToDocumentResult> {
        const { uri, patterns } = params;
        const doc = uri && documents.get(uri);
        if (!doc) {
            return {
                uri,
                version: -1,
                patternMatches: [],
                message: 'Document not found.',
            };
        }
        const text = doc.getText();
        const version = doc.version;
        const docSettings = await getSettingsToUseForDocument(doc);
        const settings = { patterns: [], ...docSettings };
        const result = await patternMatcher.matchPatternsInText(patterns, text, settings);
        const emptyResult = { ranges: [], message: undefined };
        function mapMatch(r: RegExpMatches): Api.RegExpMatchResults {
            const { elapsedTimeMs, message, regexp, ranges } = { ...emptyResult, ...r };
            return {
                regexp: regexp.toString(),
                elapsedTime: elapsedTimeMs,
                matches: ranges,
                errorMessage: message,
            };
        }
        function mapResult(r: MatchResult): Api.PatternMatch {
            return {
                name: r.name,
                defs: r.matches.map(mapMatch),
            };
        }
        const patternMatches = result.map(mapResult);
        return {
            uri,
            version,
            patternMatches,
        };
    }

    // Register API Handlers
    Object.entries(requestMethodApi).forEach(([name, fn]) => {
        connection.onRequest(name, fn);
    });

    interface DocSettingPair {
        doc: TextDocument;
        settings: CSpellUserSettings;
    }

    // validate documents
    const disposableValidate = validationRequestStream.pipe(filter((doc) => !validationByDoc.has(doc.uri))).subscribe((doc) => {
        if (!validationByDoc.has(doc.uri)) {
            const uri = doc.uri;
            if (isUriBlackListed(uri)) {
                validationByDoc.set(
                    doc.uri,
                    validationRequestStream
                        .pipe(
                            filter((doc) => uri === doc.uri),
                            take(1),
                            tap((doc) => log('Ignoring:', doc.uri))
                        )
                        .subscribe()
                );
            } else {
                validationByDoc.set(
                    doc.uri,
                    validationRequestStream
                        .pipe(
                            filter((doc) => uri === doc.uri),
                            tap((doc) => log(`Request Validate: v${doc.version}`, doc.uri)),
                            flatMap(async (doc) => ({ doc, settings: await getActiveSettings(doc) } as DocSettingPair)),
                            debounce((dsp) =>
                                timer(dsp.settings.spellCheckDelayMs || defaultDebounceMs).pipe(filter(() => !isValidationBusy))
                            ),
                            filter((dsp) => !blockValidation.has(dsp.doc.uri)),
                            flatMap(validateTextDocument)
                        )
                        .subscribe((diag) => connection.sendDiagnostics(diag))
                );
            }
        }
    });

    const disposableTriggerUpdateConfigStream = triggerUpdateConfig
        .pipe(
            tap(() => log('Trigger Update Config')),
            debounceTime(100)
        )
        .subscribe(() => {
            updateActiveSettings();
        });

    const disposableTriggerValidateAll = triggerValidateAll.pipe(debounceTime(250)).subscribe(() => {
        log('Validate all documents');
        documents.all().forEach((doc) => validationRequestStream.next(doc));
    });

    async function shouldValidateDocument(textDocument: TextDocument, settings: CSpellUserSettings): Promise<boolean> {
        const { uri } = textDocument;
        return !!settings.enabled && isLanguageEnabled(textDocument, settings) && !(await isUriExcluded(uri));
    }

    function isLanguageEnabled(textDocument: TextDocumentUriLangId, settings: CSpellUserSettings) {
        const { enabledLanguageIds = [] } = settings;
        return enabledLanguageIds.indexOf(textDocument.languageId) >= 0;
    }

    async function isUriExcluded(uri: string) {
        return documentSettings.isExcluded(uri);
    }

    async function getBaseSettings(doc: TextDocument) {
        const settings = await getActiveSettings(doc);
        return { ...CSpell.mergeSettings(defaultSettings, settings), enabledLanguageIds: settings.enabledLanguageIds };
    }

    async function getSettingsToUseForDocument(doc: TextDocument) {
        return tds.constructSettingsForText(await getBaseSettings(doc), doc.getText(), doc.languageId);
    }

    interface ValidationResult extends PublishDiagnosticsParams {}

    async function validateTextDocument(dsp: DocSettingPair): Promise<ValidationResult> {
        async function validate() {
            const { doc, settings } = dsp;
            const uri = doc.uri;
            try {
                if (!isUriAllowed(uri, settings.allowedSchemas)) {
                    const schema = uri.split(':')[0];
                    log(`Schema not allowed (${schema}), skipping:`, uri);
                    return { uri, diagnostics: [] };
                }
                const shouldCheck = await shouldValidateDocument(doc, settings);
                if (!shouldCheck) {
                    log('validateTextDocument skip:', uri);
                    return { uri, diagnostics: [] };
                }
                const settingsToUse = await getSettingsToUseForDocument(doc);
                configWatcher.processSettings(settingsToUse);
                if (settingsToUse.enabled) {
                    logInfo('Validate File', uri);
                    log(`validateTextDocument start: v${doc.version}`, uri);
                    const settings = correctBadSettings(settingsToUse);
                    logProblemsWithSettings(settings);
                    dictionaryWatcher.processSettings(settings);
                    const diagnostics: Diagnostic[] = await Validator.validateTextDocument(doc, settings);
                    log(`validateTextDocument done: v${doc.version}`, uri);
                    return { uri, diagnostics };
                }
            } catch (e) {
                logError(`validateTextDocument: ${JSON.stringify(e)}`);
            }
            return { uri, diagnostics: [] };
        }

        isValidationBusy = true;
        const r = await validate();
        isValidationBusy = false;
        return r;
    }

    const knownErrors = new Set<string>();

    function isString(s: string | undefined): s is string {
        return !!s;
    }

    function logProblemsWithSettings(settings: CSpellUserSettings) {
        function join(...s: (string | undefined)[]): string {
            return s.filter((s) => !!s).join(' ');
        }

        const importErrors = extractImportErrors(settings);

        importErrors.forEach((err) => {
            const msg = err.error.toString();
            const importedBy =
                err.referencedBy
                    ?.map((s) => s.filename)
                    .filter(isString)
                    .map((s) => '"' + s + '"') || [];
            const fullImportBy = importedBy.length ? join(' imported by \n', ...importedBy) : '';
            // const firstImportedBy = importedBy.length ? join('imported by', importedBy[0]) : '';
            const warnMsg = join(msg, fullImportBy);

            if (knownErrors.has(warnMsg)) return;
            knownErrors.add(warnMsg);
            connection.console.warn(warnMsg);
            connection.window.showWarningMessage(join(msg, fullImportBy));
        });
    }

    // Make the text document manager listen on the connection
    // for open, change and close text document events
    documents.listen(connection);

    disposables.push(
        // The content of a text document has changed. This event is emitted
        // when the text document first opened or when its content has changed.
        documents.onDidChangeContent((event) => {
            validationRequestStream.next(event.document);
        }),

        // We want to block validation during saving.
        documents.onWillSave((event) => {
            const { uri, version } = event.document;
            log(`onWillSave: v${version}`, uri);
            blockValidation.set(uri, version);
        }),

        // Enable validation once it is saved.
        documents.onDidSave((event) => {
            const { uri, version } = event.document;
            log(`onDidSave: v${version}`, uri);
            blockValidation.delete(uri);
            validationRequestStream.next(event.document);
        }),

        // Remove subscriptions when a document closes.
        documents.onDidClose((event) => {
            const uri = event.document.uri;
            const sub = validationByDoc.get(uri);
            if (sub) {
                validationByDoc.delete(uri);
                sub.unsubscribe();
            }
            // A text document was closed we clear the diagnostics
            connection.sendDiagnostics({ uri, diagnostics: [] });
        }),
        patternMatcher
    );

    function updateLogLevel() {
        connection.workspace.getConfiguration({ section: 'cSpell.logLevel' }).then(
            (result: string) => {
                fetchFolders();
                logger.level = result;
                logger.setConnection(connection);
            },
            (reject) => {
                fetchFolders();
                logger.level = LogLevel.DEBUG;
                logger.error(`Failed to get config: ${JSON.stringify(reject)}`);
                logger.setConnection(connection);
            }
        );
    }

    async function fetchFolders() {
        const folders = await connection.workspace.getWorkspaceFolders();
        if (folders) {
            setWorkspaceFolders(folders.map((f) => f.uri));
        } else {
            setWorkspaceFolders([]);
        }
    }

    connection.onCodeAction(onCodeActionHandler(documents, getBaseSettings, () => documentSettings.version, documentSettings));

    // Free up the validation streams on shutdown.
    connection.onShutdown(() => {
        disposables.forEach((d) => d.dispose());
        disposables.length = 0;
        disposableValidate.unsubscribe();
        disposableTriggerUpdateConfigStream.unsubscribe();
        disposableTriggerValidateAll.unsubscribe();
        const toDispose = [...validationByDoc.values()];
        validationByDoc.clear();
        toDispose.forEach((sub) => sub.unsubscribe());
    });

    // Listen on the connection
    connection.listen();
}
