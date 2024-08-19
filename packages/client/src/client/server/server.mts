import type {
    ClientSideApi,
    ClientSideApiDef,
    ConfigurationFields,
    GetConfigurationForDocumentResult as APIGetConfigurationForDocumentResult,
} from 'code-spell-checker-server/api';
import { createClientSideApi } from 'code-spell-checker-server/api';

import type { CodeAction, CodeActionParams, Command, LanguageClient } from '../vscode-languageclient.js';
import { CodeActionRequest } from '../vscode-languageclient.js';
import { vfsReadDirectory, vfsReadFile, vfsStat } from './vfs.js';

export type {
    CheckDocumentIssue,
    ClientSideCommandHandlerApi,
    ConfigKind,
    ConfigScope,
    ConfigTarget,
    ConfigTargetCSpell,
    ConfigTargetDictionary,
    ConfigTargetVSCode,
    CSpellUserSettings,
    CustomDictionaries,
    CustomDictionary,
    CustomDictionaryEntry,
    CustomDictionaryScope,
    DictionaryDefinition,
    DictionaryDefinitionCustom,
    FieldExistsInTarget,
    IsSpellCheckEnabledResult,
    LanguageSetting,
    MatchPatternsToDocumentResult,
    NamedPattern,
    OnSpellCheckDocumentStep,
    PartialCSpellUserSettings,
    PatternMatch,
    SpellCheckerDiagnosticData,
    SpellCheckerSettingsProperties,
    SplitTextIntoWordsResult,
    WorkspaceConfigForDocumentRequest,
    WorkspaceConfigForDocumentResponse,
} from 'code-spell-checker-server/api';

export type GetConfigurationForDocumentResult<F extends ConfigurationFields> = Partial<APIGetConfigurationForDocumentResult<F>> &
    Pick<
        APIGetConfigurationForDocumentResult<F>,
        'enabled' | 'enabledVSCode' | 'configFiles' | 'configTargets' | 'fileEnabled' | 'fileIsIncluded' | 'fileIsExcluded'
    >;

interface ServerSide {
    getConfigurationForDocument: ClientSideApi['serverRequest']['getConfigurationForDocument'];
    getConfigurationTargets: ClientSideApi['serverRequest']['getConfigurationTargets'];
    getSpellCheckingOffsets: ClientSideApi['serverRequest']['getSpellCheckingOffsets'];
    isSpellCheckEnabled: ClientSideApi['serverRequest']['isSpellCheckEnabled'];
    notifyConfigChange: ClientSideApi['serverNotification']['notifyConfigChange'];
    registerConfigurationFile: ClientSideApi['serverNotification']['registerConfigurationFile'];
    spellingSuggestions: ClientSideApi['serverRequest']['spellingSuggestions'];
    traceWord: ClientSideApi['serverRequest']['traceWord'];
    checkDocument: ClientSideApi['serverRequest']['checkDocument'];
}

interface ExtensionSide {
    onDiagnostics: ClientSideApi['clientNotification']['onDiagnostics']['subscribe'];
    onDocumentConfigChange: ClientSideApi['clientNotification']['onDocumentConfigChange']['subscribe'];
    onSpellCheckDocument: ClientSideApi['clientNotification']['onSpellCheckDocument']['subscribe'];
    onWorkspaceConfigForDocumentRequest: ClientSideApi['clientRequest']['onWorkspaceConfigForDocumentRequest']['subscribe'];
}
export interface ServerApi extends ServerSide, ExtensionSide, Disposable {}

interface Disposable {
    dispose: () => void;
}

type RequestCodeActionResult = (Command | CodeAction)[] | null;

export async function requestCodeAction(client: LanguageClient, params: CodeActionParams): Promise<RequestCodeActionResult> {
    const request = CodeActionRequest.type;
    const result = await client.sendRequest(request, params);
    return result;
}

export function createServerApi(client: LanguageClient): ServerApi {
    const def: ClientSideApiDef = {
        serverRequests: {
            isSpellCheckEnabled: true,
            getConfigurationForDocument: true,
            getConfigurationTargets: true,
            getSpellCheckingOffsets: true,
            spellingSuggestions: true,
            splitTextIntoWords: true,
            traceWord: true,
            checkDocument: true,
        },
        serverNotifications: {
            notifyConfigChange: true,
            registerConfigurationFile: true,
        },
        clientNotifications: {
            onSpellCheckDocument: true,
            onDiagnostics: true,
            onDocumentConfigChange: true,
        },
        clientRequests: {
            onWorkspaceConfigForDocumentRequest: true,
            vfsReadDirectory,
            vfsReadFile,
            vfsStat,
        },
    };

    const rpcApi = createClientSideApi(client, def, { log: () => undefined });

    const { serverNotification, serverRequest, clientNotification, clientRequest } = rpcApi;

    const api: ServerApi = {
        isSpellCheckEnabled: log2Sfn(serverRequest.isSpellCheckEnabled, 'isSpellCheckEnabled'),
        getConfigurationForDocument: log2Sfn(serverRequest.getConfigurationForDocument, 'getConfigurationForDocument'),
        getConfigurationTargets: log2Sfn(serverRequest.getConfigurationTargets, 'getConfigurationTargets'),
        getSpellCheckingOffsets: log2Sfn(serverRequest.getSpellCheckingOffsets, 'getSpellCheckingOffsets'),
        spellingSuggestions: log2Sfn(serverRequest.spellingSuggestions, 'spellingSuggestions'),
        notifyConfigChange: log2Sfn(serverNotification.notifyConfigChange, 'notifyConfigChange'),
        registerConfigurationFile: log2Sfn(serverNotification.registerConfigurationFile, 'registerConfigurationFile'),
        traceWord: log2Sfn(serverRequest.traceWord, 'traceWord'),
        checkDocument: log2Sfn(serverRequest.checkDocument, 'checkDocument'),
        onSpellCheckDocument: (fn) => clientNotification.onSpellCheckDocument.subscribe(log2Cfn(fn, 'onSpellCheckDocument')),
        onDocumentConfigChange: (fn) => clientNotification.onDocumentConfigChange.subscribe(log2Cfn(fn, 'onDocumentConfigChange')),
        onDiagnostics: (fn) => clientNotification.onDiagnostics.subscribe(log2Cfn(fn, 'onDiagnostics')),
        onWorkspaceConfigForDocumentRequest: (fn) =>
            clientRequest.onWorkspaceConfigForDocumentRequest.subscribe(log2Cfn(fn, 'onWorkspaceConfigForDocumentRequest')),
        dispose: rpcApi.dispose,
    };

    return api;
}

let reqNum = 0;
const debugCommunication = false;
const debugServerComms = true;
const debugClientComms = true;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function log2Sfn<P extends any[], T>(fn: (...p: P) => T | Promise<T>, reqName: string): (...p: P) => Promise<T> {
    return (...params: P) => log2S<P, T>(params, fn(...params), reqName);
}

function log2S<P, T>(params: P, value: Promise<T> | T, reqName: string): Promise<T> {
    return logCommunication<P, T>('Server R/N', params, value, reqName, debugServerComms);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function log2Cfn<P extends any[], T>(fn: (...p: P) => T | Promise<T>, reqName: string): (...p: P) => Promise<T> {
    return (...params: P) => log2C<P, T>(params, fn(...params), reqName);
}

function log2C<P, T>(params: P, value: Promise<T> | T, reqName: string): Promise<Awaited<T>> {
    return logCommunication<P, T>('Client R/N', params, value, reqName, debugClientComms);
}

async function logCommunication<P, T>(kind: string, params: P, value: Promise<T> | T, name: string, log: boolean): Promise<Awaited<T>> {
    const id = ++reqNum;
    let result: Awaited<T> | undefined = undefined;
    if (log && debugCommunication) console.log('%s %i Start %s: %s(%o)', new Date().toISOString(), id, kind, name, params);
    try {
        result = await value;
        return result;
    } finally {
        if (log && debugCommunication) console.log('%s %i End   %s: %s, %o', new Date().toISOString(), id, kind, name, result);
    }
}
