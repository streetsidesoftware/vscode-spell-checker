import { isDefined, LogFileConnection } from '@internal/common-utils';
import { log, logError, logger, logInfo, setWorkspaceBase, setWorkspaceFolders } from '@internal/common-utils/log';
import { toFileUri, toUri } from '@internal/common-utils/uriHelper';
import type { CSpellSettingsWithSourceTrace, Glob } from 'cspell-lib';
import * as CSpell from 'cspell-lib';
import { extractImportErrors, getDefaultSettings, refreshDictionaryCache } from 'cspell-lib';
import type { Subscription } from 'rxjs';
import { interval, ReplaySubject } from 'rxjs';
import { debounceTime, filter, mergeMap, take, tap, throttle, throttleTime } from 'rxjs/operators';
import type { DisposableLike } from 'utils-disposables';
import { createDisposableList } from 'utils-disposables';
import { LogLevelMasks } from 'utils-logger';
import type {
    Diagnostic,
    DidChangeConfigurationParams,
    InitializeParams,
    InitializeResult,
    PublishDiagnosticsParams,
    ServerCapabilities,
} from 'vscode-languageserver/node.js';
import {
    CodeActionKind,
    createConnection,
    DiagnosticSeverity,
    ProposedFeatures,
    TextDocuments,
    TextDocumentSyncKind,
} from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';

import type * as Api from './api.js';
import { createOnCodeActionHandler } from './codeActions.mjs';
import { calculateConfigTargets } from './config/configTargetsHelper.mjs';
import { ConfigWatcher } from './config/configWatcher.mjs';
import type { CSpellUserSettings } from './config/cspellConfig/index.mjs';
import { DictionaryWatcher } from './config/dictionaryWatcher.mjs';
import type { SettingsCspell } from './config/documentSettings.mjs';
import {
    correctBadSettings,
    DocumentSettings,
    isUriAllowedBySettings,
    isUriBlockedBySettings,
    stringifyPatterns,
} from './config/documentSettings.mjs';
import { isFileTypeEnabled } from './config/extractEnabledFileTypes.mjs';
import { sanitizeSettings } from './config/sanitizeSettings.mjs';
import type { TextDocumentUri } from './config/vscode.config.mjs';
import { defaultCheckLimit } from './constants.mjs';
import { DocumentValidationController } from './DocumentValidationController.mjs';
import { handleCheckDocumentRequest } from './handleCheckDocumentRequest.js';
import { createProgressNotifier } from './progressNotifier.mjs';
import type { PartialServerSideHandlers } from './serverApi.mjs';
import { createServerApi } from './serverApi.mjs';
import { createOnSuggestionsHandler } from './suggestionsServer.mjs';
import { handleTraceRequest } from './trace.js';
import type { MinifiedReason } from './utils/analysis.mjs';
import { defaultIsTextLikelyMinifiedOptions, isTextLikelyMinified } from './utils/analysis.mjs';
import { catchPromise } from './utils/catchPromise.mjs';
import { debounce as simpleDebounce } from './utils/debounce.mjs';
import { textToWords } from './utils/index.mjs';
import { createPrecisionLogger } from './utils/logging.mjs';
import * as Validator from './validator.mjs';
import { bindFileSystemProvider } from './vfs/CSpellFileSystemProvider.mjs';

log('Starting Spell Checker Server');

const overRideDefaults: CSpellUserSettings = {
    id: 'Extension overrides',
    patterns: [],
    ignoreRegExpList: [],
};

const defaultSettings = calcDefaultSettings();
const defaultDebounceMs = 50;
// Refresh the dictionary cache every 1000ms.
const dictionaryRefreshRateMs = 10000;

async function calcDefaultSettings(): Promise<CSpellUserSettings> {
    return {
        ...CSpell.mergeSettings(await getDefaultSettings(), await CSpell.getGlobalSettingsAsync(), overRideDefaults),
        checkLimit: defaultCheckLimit,
    };
}

export function run(): void {
    // debounce buffer
    const disposables = createDisposableList();
    const validationRequestStream = new ReplaySubject<TextDocument>(1);
    const triggerUpdateConfig = new ReplaySubject<void>(1);
    const triggerValidateAll = new ReplaySubject<void>(1);
    const validationByDoc = new Map<string, Subscription>();
    const blockValidation = new Map<string, number>();
    let isValidationBusy = false;
    const dictionaryWatcher = dd(new DictionaryWatcher());
    dd(disposeValidationByDoc);

    const blockedFiles = new Map<string, Api.BlockedFileReason>();

    const configWatcher = dd(new ConfigWatcher());

    // Create a connection for the server. The connection uses Node's IPC as a transport
    log('Create Connection');
    const connection = createConnection(ProposedFeatures.all);

    const _logger = createPrecisionLogger().setLogLevelMask(LogLevelMasks.none);

    // Create a simple text document manager.
    const documents = new TextDocuments(TextDocument);

    const handlers: PartialServerSideHandlers = {
        serverNotifications: {
            notifyConfigChange: (...p) => (logInfo('notifyConfigChange'), onConfigChange(...p)),
            registerConfigurationFile,
        },
        serverRequests: {
            getConfigurationForDocument: handleGetConfigurationForDocument,
            getConfigurationTargets: handleGetConfigurationTargets,
            getSpellCheckingOffsets: simpleDebounce(_handleGetSpellCheckingOffsets, 100, ({ uri }) => uri),
            traceWord: simpleDebounce(_handleGetWordTrace, 100, ({ uri, word }) => uri + '|' + word),
            checkDocument: simpleDebounce(_handleCheckDocument, 100, ({ uri }) => uri),
            isSpellCheckEnabled: handleIsSpellCheckEnabled,
            splitTextIntoWords: handleSplitTextIntoWords,
            spellingSuggestions: createOnSuggestionsHandler(documents, {
                fetchSettings: getBaseSettings,
                getSettingsVersion: () => documentSettings.version,
            }),
        },
    };

    const clientServerApi: Api.ServerSideApi = dd(createServerApi(connection, handlers, _logger));

    dd(bindFileSystemProvider(connection, clientServerApi, documents));

    const documentSettings = new DocumentSettings(connection, clientServerApi, defaultSettings);
    const docValidationController = dd(new DocumentValidationController(documentSettings, documents));

    const progressNotifier = createProgressNotifier(clientServerApi);

    // Notify the client when the config has changed for a document.
    dd(
        documentSettings.onDidUpdateConfiguration(
            (update) => (
                logInfo('onDidUpdateConfiguration'), clientServerApi.clientNotification.onDocumentConfigChange({ uris: [update.uri] })
            ),
        ),
    );

    dd(
        connection.onInitialize((params: InitializeParams): InitializeResult => {
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
        }),
    );

    // The settings have changed. Is sent on server activation as well.
    dd(connection.onDidChangeConfiguration((...p) => (logInfo('onDidChangeConfiguration'), onConfigChange(...p))));

    const _getActiveUriSettings = simpleDebounce(__getActiveUriSettings, 50);

    // Listen for event messages from the client.
    dd(dictionaryWatcher.listen(onDictionaryChange));
    dd(configWatcher.listen(onConfigFileChange));

    const _handleIsSpellCheckEnabled = simpleDebounce(
        __handleIsSpellCheckEnabled,
        50,
        ({ uri, languageId }) => `(${uri})::(${languageId})`,
    );

    const _handleGetConfigurationForDocument = simpleDebounce(__handleGetConfigurationForDocument, 100, (params) => JSON.stringify(params));
    const _handleGetConfigurationTargets = simpleDebounce(__handleGetConfigurationTargets, 100, (params) => JSON.stringify(params));

    // validate documents
    ds(
        validationRequestStream.pipe(filter((doc) => !validationByDoc.has(doc.uri))).subscribe((doc) => {
            if (validationByDoc.has(doc.uri)) return;
            const uri = doc.uri;

            log('Register Document Handler:', uri);

            if (isUriBlockedBySettings(uri, {})) {
                validationByDoc.set(
                    doc.uri,
                    validationRequestStream
                        .pipe(
                            filter((doc) => uri === doc.uri),
                            take(1),
                            tap((doc) => progressNotifier.emitSpellCheckDocumentStep(doc, 'ignore')),
                            tap((doc) => log('Ignoring:', doc.uri)),
                        )
                        .subscribe(),
                );
            } else {
                validationByDoc.set(
                    doc.uri,
                    validationRequestStream
                        .pipe(
                            filter((doc) => uri === doc.uri),
                            tap((doc) => progressNotifier.emitSpellCheckDocumentStep(doc, 'start')),
                            tap((doc) => log(`Request Validate: v${doc.version}`, doc.uri)),
                        )
                        .pipe(
                            throttleTime(defaultDebounceMs, undefined, { leading: true, trailing: true }),
                            mergeMap(async (doc) => ({ doc, settings: await getActiveSettings(doc) }) as DocSettingPair),
                            tap((dsp) => progressNotifier.emitSpellCheckDocumentStep(dsp.doc, 'settings determined')),
                            throttle(
                                (dsp) =>
                                    interval(dsp.settings.spellCheckDelayMs || defaultDebounceMs).pipe(filter(() => !isValidationBusy)),
                                { leading: true, trailing: true },
                            ),
                            filter((dsp) => !blockValidation.has(dsp.doc.uri)),
                            mergeMap(validateTextDocument),
                        )
                        .subscribe(sendDiagnostics),
                );
            }
        }),
    );

    ds(
        triggerUpdateConfig
            .pipe(
                tap(() => log('Trigger Update Config')),
                throttleTime(1000, undefined, { leading: true, trailing: true }),
                tap(() => log('Update Config Triggered')),
                mergeMap(updateActiveSettings),
            )
            .subscribe(() => {
                docValidationController.clear();
                log('Update Config Completed');
            }),
    );

    ds(
        triggerValidateAll.pipe(debounceTime(250)).subscribe(() => {
            log('Validate all documents');
            documents.all().forEach((doc) => validationRequestStream.next(doc));
        }),
    );

    const knownErrors = new Set<string>();

    // Make the text document manager listen on the connection
    // for open, change and close text document events
    dd(documents.listen(connection));

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
            documentSettings.releaseUriSettings(uri);
            // A text document was closed we clear the diagnostics
            // catchPromise(connection.sendDiagnostics({ uri, diagnostics: [] }), 'onDidClose');
        }),
    );

    dd(
        connection.onCodeAction(
            createOnCodeActionHandler(documents, {
                fetchSettings: getBaseSettings,
                getSettingsVersion: () => documentSettings.version,
                fetchWorkspaceConfigForDocument: (uri) => documentSettings.fetchWorkspaceConfiguration(uri),
            }),
        ),
    );

    // Free up the validation streams on shutdown.
    connection.onShutdown(() => {
        disposables.dispose();
    });

    // Listen on the connection
    connection.listen();

    return;

    /******************************************************************* */

    function onDictionaryChange(eventType?: string, filename?: string) {
        logInfo(`Dictionary Change ${eventType}`, filename);
        if (eventType === 'close') return;
        triggerUpdateConfig.next(undefined);
    }

    function onConfigFileChange(eventType?: string, filename?: string) {
        logInfo(`Config File Change ${eventType}`, filename);
        if (eventType === 'close') return;
        handleConfigChange();
    }

    function onConfigChange(_change?: OnChangeParam) {
        logInfo('Configuration Change');
        handleConfigChange();
    }

    function handleConfigChange() {
        triggerUpdateConfig.next(undefined);
        catchPromise(updateLogLevel(), 'handleConfigChange');
    }

    async function updateActiveSettings() {
        log('updateActiveSettings');
        await documentSettings.resetSettings();
        dictionaryWatcher.clear();
        blockedFiles.clear();
        triggerValidateAll.next(undefined);
    }

    function getActiveSettings(doc: TextDocumentUri | undefined) {
        return getActiveUriSettings(doc?.uri);
    }

    function getActiveUriSettings(uri?: string) {
        return _getActiveUriSettings(uri);
    }

    function __getActiveUriSettings(uri?: string) {
        // Give the dictionaries a chance to refresh if they need to.
        log('getActiveUriSettings', uri);
        catchPromise(refreshDictionaryCache(dictionaryRefreshRateMs), '__getActiveUriSettings');
        return documentSettings.getUriSettings(uri);
    }

    async function registerConfigurationFile(path: string) {
        const waitFor = documentSettings.registerConfigurationFile(path);
        logInfo('Register Configuration File', path);
        await waitFor;
        triggerUpdateConfig.next(undefined);
    }

    async function handleIsSpellCheckEnabled(params: TextDocumentInfo): Promise<Api.IsSpellCheckEnabledResult> {
        return _handleIsSpellCheckEnabled(params);
    }

    async function __handleIsSpellCheckEnabled(params: TextDocumentInfo): Promise<Api.IsSpellCheckEnabledResult> {
        log('handleIsSpellCheckEnabled', params.uri);
        const activeSettings = await getActiveUriSettings(params.uri);
        return calcIncludeExcludeInfo(activeSettings, params);
    }

    async function handleGetConfigurationForDocument(
        params: Api.GetConfigurationForDocumentRequest<Api.ConfigurationFields>,
    ): Promise<Api.GetConfigurationForDocumentResult<Api.ConfigurationFields>> {
        return _handleGetConfigurationForDocument(params);
    }

    async function __handleGetConfigurationForDocument(
        params: Api.GetConfigurationForDocumentRequest<Api.ConfigurationFields>,
    ): Promise<Api.GetConfigurationForDocumentResult<Api.ConfigurationFields>> {
        log('handleGetConfigurationForDocument', params.uri);
        const { uri, workspaceConfig, fields } = params;
        const doc = (uri && documents.get(uri)) || undefined;
        // console.warn('__handleGetConfigurationForDocument: %o', {
        //     params,
        //     doc: { uri: doc?.uri, languageId: doc?.languageId, version: doc?.version },
        // });
        const docSettingsRaw = (doc && (await getSettingsToUseForDocument(doc))) || undefined;
        const settingsRaw = await getActiveUriSettings(uri);
        const configFiles = uri ? (await documentSettings.findCSpellConfigurationFilesForUri(uri)).map((uri) => uri.toString()) : [];
        const configTargets = workspaceConfig ? await calculateConfigTargets(settingsRaw, workspaceConfig, configFiles) : [];
        const ieInfo = await calcIncludeExcludeInfo(settingsRaw, params);

        const docSettings = stringifyPatterns(sanitizeSettings(docSettingsRaw, fields));
        const settings = stringifyPatterns(sanitizeSettings(settingsRaw, fields));

        // console.warn('%o', {
        //     fields,
        //     settingsKeys: objectKeysNested(settings),
        //     settingsSize: JSON.stringify(settings).length,
        //     sizes: objectFieldSizes(settings),
        // });

        return {
            configFiles,
            configTargets,
            docSettings,
            settings,
            ...ieInfo,
        };
    }

    async function handleGetConfigurationTargets(params: Api.GetConfigurationTargetsRequest): Promise<Api.GetConfigurationTargetsResult> {
        return _handleGetConfigurationTargets(params);
    }

    async function __handleGetConfigurationTargets(params: Api.GetConfigurationTargetsRequest): Promise<Api.GetConfigurationTargetsResult> {
        log('handleGetConfigurationTargets', params.uri);
        const { uri, workspaceConfig } = params;
        const settingsRaw = await getActiveUriSettings(uri);
        const configFiles = uri ? (await documentSettings.findCSpellConfigurationFilesForUri(uri)).map((uri) => uri.toString()) : [];
        const configTargets = workspaceConfig ? await calculateConfigTargets(settingsRaw, workspaceConfig, configFiles) : [];

        return {
            configTargets,
        };
    }

    async function _handleGetSpellCheckingOffsets(docRef: Api.TextDocumentRef): Promise<Api.GetSpellCheckingOffsetsResult> {
        log('handleGetSpellCheckingOffsets', docRef.uri);
        const { uri } = docRef;
        const doc = documents.get(uri);
        if (!doc) return { offsets: [] };
        const docVal = await docValidationController.getDocumentValidator(doc);
        const offsets = docVal.getCheckedTextRanges().flatMap((r) => [r.startPos, r.endPos]);
        return { offsets };
    }

    async function _handleGetWordTrace(req: Api.TraceWordRequest): Promise<Api.TraceWordResult> {
        log(`_handleGetWordTrace "${req.word}"`, req.uri);
        return handleTraceRequest(docValidationController, req, (uri) => documents.get(uri));
    }

    async function _handleCheckDocument(doc: Api.TextDocumentInfo, options?: Api.CheckDocumentOptions): Promise<Api.CheckDocumentResult> {
        return handleCheckDocumentRequest(docValidationController, doc, options || {}, (uri) => documents.get(uri), shouldValidateDocument);
    }

    async function getExcludedBy(uri: string): Promise<Api.ExcludeRef[]> {
        function globToString(g: Glob): string {
            if (typeof g === 'string') return g;
            return g.glob;
        }

        function extractGlobSourceUri(settings: CSpellSettingsWithSourceTrace): string | undefined {
            const filename = settings.__importRef?.filename || settings.source?.filename;
            return toFileUri(filename)?.toString();
        }

        const ex = await documentSettings.calcExcludedBy(uri);
        return ex.map((ex) => ({
            glob: globToString(ex.glob),
            configUri: extractGlobSourceUri(ex.settings),
            id: ex.settings.id,
            name: ex.settings.name,
        }));
    }

    function handleSplitTextIntoWords(text: string): Api.SplitTextIntoWordsResult {
        return {
            words: textToWords(text),
        };
    }

    function sendDiagnostics(result: ValidationResult) {
        log(`Send Diagnostics v${result.version}`, result.uri);

        const { uri, version, diagnostics } = result;

        const diags: Required<PublishDiagnosticsParams> = { uri, version, diagnostics };

        // This is to filter out the "Off" severity that is used to hide issues from the VS Code Problems panel.
        const knownDiagnosticSeverityLevels = new Set<number | undefined>([
            DiagnosticSeverity.Error,
            DiagnosticSeverity.Warning,
            DiagnosticSeverity.Information,
            DiagnosticSeverity.Hint,
        ]);

        function mapDiagnostic(diag: Diagnostic): Diagnostic {
            return {
                ...diag,
                severity: knownDiagnosticSeverityLevels.has(diag.severity) ? diag.severity : undefined,
            };
        }

        const diagsForClient = { ...diags, diagnostics: diags.diagnostics.map(mapDiagnostic) };
        catchPromise(clientServerApi.clientNotification.onDiagnostics(diagsForClient));
    }

    type ShouldValidateDocument = Pick<TextDocument, 'uri'> & Partial<TextDocument>;

    async function shouldValidateDocument(textDocument: ShouldValidateDocument, settings: CSpellUserSettings): Promise<boolean> {
        const { uri, languageId } = textDocument;
        return (
            !!settings.enabled &&
            (!languageId || isFileTypeEnabled(languageId, settings)) &&
            !(await isUriExcluded(uri)) &&
            !isBlocked(textDocument, settings)
        );
    }

    function isBlocked(textDocument: ShouldValidateDocument, settings: CSpellUserSettings): boolean {
        const { uri } = textDocument;
        const {
            blockCheckingWhenLineLengthGreaterThan = defaultIsTextLikelyMinifiedOptions.blockCheckingWhenLineLengthGreaterThan,
            blockCheckingWhenAverageChunkSizeGreaterThan = defaultIsTextLikelyMinifiedOptions.blockCheckingWhenAverageChunkSizeGreaterThan,
            blockCheckingWhenTextChunkSizeGreaterThan = defaultIsTextLikelyMinifiedOptions.blockCheckingWhenTextChunkSizeGreaterThan,
        } = settings;
        const isMiniReason =
            textDocument.getText &&
            isTextLikelyMinified(textDocument.getText(), {
                blockCheckingWhenAverageChunkSizeGreaterThan,
                blockCheckingWhenLineLengthGreaterThan,
                blockCheckingWhenTextChunkSizeGreaterThan,
            });

        if (isMiniReason) {
            const notify = !blockedFiles.has(uri);
            blockedFiles.set(uri, isMiniReason);
            log(`File is blocked: ${isMiniReason.message}`, uri);
            if (notify) {
                notifyUserAboutBlockedFile(uri, isMiniReason);
            }
        } else {
            blockedFiles.delete(uri);
        }

        return !!isMiniReason;
    }

    async function calcIncludeExcludeInfo(
        settings: Api.CSpellUserSettings,
        params: TextDocumentInfo,
    ): Promise<Api.IsSpellCheckEnabledResult> {
        log('calcIncludeExcludeInfo', params.uri);
        const { uri, languageId } = params;
        const languageIdEnabled = languageId ? isFileTypeEnabled(languageId, settings) : undefined;

        const {
            enabled = true,
            enabledVSCode = true,
            include: fileIsIncluded = true,
            exclude: fileIsExcluded = false,
            ignored: gitignored = undefined,
            gitignoreInfo = undefined,
            uriUsed = undefined,
            schemeIsAllowed = undefined,
            schemeIsKnown = undefined,
        } = uri ? await calcFileIncludeExclude(uri) : {};
        const blockedReason = uri ? blockedFiles.get(uri) : undefined;
        const fileEnabled = fileIsIncluded && !fileIsExcluded && !gitignored && !blockedReason;
        const excludedBy = fileIsExcluded && uri ? await getExcludedBy(uri) : undefined;
        const workspaceFolder = (uriUsed && (await documentSettings.matchingFoldersForUri(uriUsed))[0]) || undefined;
        log('calcIncludeExcludeInfo done', params.uri);
        return {
            enabled,
            enabledVSCode,
            uriUsed,
            workspaceFolderUri: workspaceFolder?.uri,
            excludedBy,
            fileEnabled,
            fileIsExcluded,
            fileIsIncluded,
            languageIdEnabled: languageIdEnabled,
            languageId,
            gitignored,
            gitignoreInfo,
            blockedReason: uri ? blockedFiles.get(uri) : undefined,
            schemeIsAllowed,
            schemeIsKnown,
        };
    }
    async function isUriExcluded(uri: string): Promise<boolean> {
        const ie = await calcFileIncludeExclude(uri);
        return !ie.include || ie.exclude || !!ie.ignored;
    }

    function calcFileIncludeExclude(uri: string) {
        return documentSettings.calcIncludeExclude(toUri(uri));
    }

    async function getBaseSettings(doc: TextDocumentUri | undefined) {
        const settings = await getActiveSettings(doc);
        return settings;
    }

    async function getSettingsToUseForDocument(doc: TextDocument) {
        return CSpell.constructSettingsForText(await getBaseSettings(doc), doc.getText(), doc.languageId);
    }

    function isStale(doc: TextDocument, writeLog = true): boolean {
        const currDoc = documents.get(doc.uri);
        const stale = currDoc?.version !== doc.version;
        if (stale && writeLog) {
            log(`validateTextDocument stale ${currDoc?.version} <> ${doc.version}:`, doc.uri);
        }
        return stale;
    }

    async function validateTextDocument(dsp: DocSettingPair): Promise<ValidationResult> {
        async function validate(): Promise<ValidationResult> {
            const { doc, settings } = dsp;
            const { uri, version } = doc;

            const result: ValidationResult = { uri, version, diagnostics: [] };

            try {
                if (!isUriAllowedBySettings(uri, settings)) {
                    const schema = uri.split(':')[0];
                    log(`Schema not allowed (${schema}), skipping:`, uri);
                    return result;
                }
                if (isStale(doc)) {
                    return result;
                }
                const shouldCheck = await shouldValidateDocument(doc, settings);
                if (!shouldCheck) {
                    log('validateTextDocument skip:', uri);
                    return result;
                }
                log(`getSettingsToUseForDocument start ${doc.version}`, uri);
                const settingsToUse = await getSettingsToUseForDocument(doc);
                log(`getSettingsToUseForDocument middle ${doc.version}`, uri);
                configWatcher.processSettings(settingsToUse);
                log(`getSettingsToUseForDocument done ${doc.version}`, uri);
                if (isStale(doc)) {
                    return result;
                }
                if (settingsToUse.enabled) {
                    logInfo(`Validate File: v${doc.version}`, uri);
                    log(`validateTextDocument start: v${doc.version}`, uri);
                    const settings = correctBadSettings(settingsToUse);
                    logProblemsWithSettings(settings);
                    dictionaryWatcher.processSettings(settings);
                    const diagnostics: Diagnostic[] = await Validator.validateTextDocument(doc, settings);
                    log(`validateTextDocument done: v${doc.version}`, uri);
                    return { ...result, diagnostics };
                }
            } catch (e) {
                logError(`validateTextDocument: ${JSON.stringify(e)}`);
            }
            return result;
        }

        isValidationBusy = true;
        progressNotifier.emitSpellCheckDocumentStep(dsp.doc, 'start validation');
        const r = await validate();
        progressNotifier.emitSpellCheckDocumentStep(dsp.doc, 'end validation', r.diagnostics.length);
        isValidationBusy = false;
        return r;
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
                    .filter(isDefined)
                    .filter((a) => !!a)
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

    async function updateLogLevel() {
        try {
            const results: string[] = await connection.workspace.getConfiguration([
                { section: 'cSpell.logLevel' },
                { section: 'cSpell.logFile' },
            ]);
            const logLevel = results[0];
            const logFile = results[1];
            logger.level = logLevel;
            updateLoggerConnection(logFile);
            // console.error('UpdateLogLevel: %o %s', [logLevel, logFile], process.cwd());
        } catch (reject) {
            logger.setConnection({ console, onExit: () => undefined });
            const message = `Failed to get config: ${JSON.stringify(reject)}`;
            logger.error(message);
        }
        fetchFolders();
    }

    function updateLoggerConnection(logFile: string | undefined) {
        if (!logFile?.endsWith('.log')) {
            logger.setConnection(connection);
            return;
        }
        const oldConnection = logger.connection;
        if (oldConnection instanceof LogFileConnection && oldConnection.filename === logFile) {
            return;
        }
        logger.setConnection(new LogFileConnection(logFile));
        if (oldConnection instanceof LogFileConnection) {
            oldConnection.close();
        }
    }

    async function fetchFolders() {
        const folders = await connection.workspace.getWorkspaceFolders();
        if (folders) {
            setWorkspaceFolders(folders.map((f) => f.uri));
        } else {
            setWorkspaceFolders([]);
        }
        return folders || undefined;
    }

    function disposeValidationByDoc() {
        const sub = [...validationByDoc.values()];
        validationByDoc.clear();
        for (const s of sub) {
            try {
                s.unsubscribe();
            } catch (e) {
                console.error(e);
            }
        }
    }

    /**
     * Record disposable to be disposed.
     * @param disposable - a disposable
     * @returns the disposable
     */
    function dd<T extends DisposableLike>(disposable: T): T;
    /**
     * Record disposable to be disposed.
     * @param disposable - a disposable
     * @param moreDisposables - more disposables.
     * @returns the disposable
     */
    function dd<T extends DisposableLike>(disposable: T, ...moreDisposables: T[]): T;
    function dd<T extends DisposableLike>(disposable: T, ...moreDisposables: DisposableLike[]): T {
        disposables.push(disposable, ...moreDisposables);
        return disposable;
    }

    function ds<T extends { unsubscribe: () => void }>(v: T): T {
        disposables.push(() => v.unsubscribe());
        return v;
    }

    async function notifyUserAboutBlockedFile(uri: string, reason: MinifiedReason) {
        try {
            clientServerApi.clientNotification.onBlockFile({ uri, reason });
        } catch (e) {
            logError(`notifyUserAboutBlockedFile ${e}`);
        }
    }
}

interface TextDocumentInfo {
    uri?: string;
    languageId?: string;
    text?: string;
}

interface ValidationResult extends PublishDiagnosticsParams {
    version: number;
}

interface OnChangeParam extends DidChangeConfigurationParams {
    settings: SettingsCspell;
}

interface DocSettingPair {
    doc: TextDocument;
    settings: CSpellUserSettings;
}
