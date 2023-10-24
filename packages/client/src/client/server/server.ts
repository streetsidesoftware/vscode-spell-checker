import type { ClientSideApi, ClientSideApiDef } from 'code-spell-checker-server/api';
import { createClientSideApi } from 'code-spell-checker-server/api';
import type { CodeAction, CodeActionParams, Command, LanguageClient } from 'vscode-languageclient/node';
import { CodeActionRequest } from 'vscode-languageclient/node';
export type {
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
    GetConfigurationForDocumentResult,
    IsSpellCheckEnabledResult,
    LanguageSetting,
    MatchPatternsToDocumentResult,
    NamedPattern,
    OnSpellCheckDocumentStep,
    PatternMatch,
    SpellCheckerDiagnosticData,
    SpellCheckerSettingsProperties,
    SplitTextIntoWordsResult,
    WorkspaceConfigForDocumentRequest,
    WorkspaceConfigForDocumentResponse,
} from 'code-spell-checker-server/api';

interface ServerSide {
    getConfigurationForDocument: ClientSideApi['serverRequest']['getConfigurationForDocument'];
    isSpellCheckEnabled: ClientSideApi['serverRequest']['isSpellCheckEnabled'];
    notifyConfigChange: ClientSideApi['serverNotification']['notifyConfigChange'];
    registerConfigurationFile: ClientSideApi['serverNotification']['registerConfigurationFile'];
    spellingSuggestions: ClientSideApi['serverRequest']['spellingSuggestions'];
}

interface ExtensionSide {
    onSpellCheckDocument: ClientSideApi['clientNotification']['onSpellCheckDocument']['subscribe'];
    onWorkspaceConfigForDocumentRequest: ClientSideApi['clientRequest']['onWorkspaceConfigForDocumentRequest']['subscribe'];
    onDiagnostics: ClientSideApi['clientNotification']['onDiagnostics']['subscribe'];
}
export interface ServerApi extends ServerSide, ExtensionSide, Disposable {}

type Disposable = {
    dispose: () => void;
};

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
            spellingSuggestions: true,
            splitTextIntoWords: true,
        },
        serverNotifications: {
            notifyConfigChange: true,
            registerConfigurationFile: true,
        },
        clientNotifications: {
            onSpellCheckDocument: true,
            onDiagnostics: true,
        },
        clientRequests: {
            onWorkspaceConfigForDocumentRequest: true,
        },
    };

    const rpcApi = createClientSideApi(client, def, { log: () => undefined });

    const { serverNotification, serverRequest, clientNotification, clientRequest } = rpcApi;

    const api: ServerApi = {
        isSpellCheckEnabled: log2Sfn(serverRequest.isSpellCheckEnabled, 'isSpellCheckEnabled'),
        getConfigurationForDocument: log2Sfn(serverRequest.getConfigurationForDocument, 'getConfigurationForDocument'),
        spellingSuggestions: log2Sfn(serverRequest.spellingSuggestions, 'spellingSuggestions'),
        notifyConfigChange: log2Sfn(serverNotification.notifyConfigChange, 'notifyConfigChange'),
        registerConfigurationFile: log2Sfn(serverNotification.registerConfigurationFile, 'registerConfigurationFile'),
        onSpellCheckDocument: (fn) => clientNotification.onSpellCheckDocument.subscribe(log2Cfn(fn, 'onSpellCheckDocument')),
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
    log && debugCommunication && console.log('%s %i Start %s: %s(%o)', new Date().toISOString(), id, kind, name, params);
    try {
        result = await value;
        return result;
    } finally {
        log && debugCommunication && console.log('%s %i End   %s: %s, %o', new Date().toISOString(), id, kind, name, result);
    }
}
