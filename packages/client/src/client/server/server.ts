import type {
    ClientNotifications,
    ClientNotificationsApi,
    ClientSideApi,
    ClientSideApiDef,
    Fn,
    Req,
    RequestResponseFn,
    RequestsToClient,
    Res,
    ServerNotifyApi,
} from 'code-spell-checker-server/api';
import { createClientSideApi } from 'code-spell-checker-server/api';
import { createDisposableList } from 'utils-disposables';
import type { CodeAction, CodeActionParams, Command, LanguageClient } from 'vscode-languageclient/node';
import { CodeActionRequest, NotificationType, RequestType } from 'vscode-languageclient/node';
export type {
    ClientNotifications,
    ClientNotificationsApi,
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
    Fn,
    GetConfigurationForDocumentResult,
    IsSpellCheckEnabledResult,
    LanguageSetting,
    MatchPatternsToDocumentResult,
    NamedPattern,
    OnSpellCheckDocumentStep,
    PatternMatch,
    Req,
    RequestResponseFn,
    RequestsToClient,
    Res,
    ServerMethods,
    ServerNotifyApi,
    ServerRequestApi,
    SpellCheckerSettingsProperties,
    SplitTextIntoWordsResult,
    WorkspaceConfigForDocumentRequest,
    WorkspaceConfigForDocumentResponse,
} from 'code-spell-checker-server/api';

export interface ServerApi extends ServerNotifyApi, ServerEventApi, Disposable {
    isSpellCheckEnabled: ClientSideApi['serverRequest']['isSpellCheckEnabled'];
    getConfigurationForDocument: ClientSideApi['serverRequest']['getConfigurationForDocument'];
    spellingSuggestions: ClientSideApi['serverRequest']['spellingSuggestions'];
    onWorkspaceConfigForDocumentRequest: ClientSideApi['clientRequest']['onWorkspaceConfigForDocumentRequest']['subscribe'];
}

type Disposable = {
    dispose: () => void;
};

type ServerEventApi = {
    [K in keyof ClientNotifications]: (handler: ClientNotificationsApi[K]) => Disposable;
};

type RequestsFromServer = {
    [K in keyof RequestsToClient]: RequestResponseFn<RequestsToClient[K]>;
};

// type RequestsFromServerHandlerApi = {
//     [M in keyof RequestsFromServer]: (handler: Fn<RequestsFromServer[M]>) => Disposable;
// };

type RequestCodeActionResult = (Command | CodeAction)[] | null;

export async function requestCodeAction(client: LanguageClient, params: CodeActionParams): Promise<RequestCodeActionResult> {
    const request = CodeActionRequest.type;
    const result = await client.sendRequest(request, params);
    return result;
}

export function createServerApi(client: LanguageClient): ServerApi {
    function onNotify<M extends keyof ServerEventApi>(method: M, fn: ClientNotificationsApi[M]) {
        const n = new NotificationType<ClientNotifications[M]>(method);
        return client.onNotification(n, fn);
    }

    function onRequest<M extends keyof RequestsFromServer>(method: M, fn: Fn<RequestsFromServer[M]>) {
        const n = new RequestType<Req<RequestsFromServer[M]>, Res<RequestsFromServer[M]>, void>(method);
        return client.onRequest(n, fn);
    }

    // function sendNotification<K extends keyof ServerNotifyApi>(method: K, ...params: Parameters<ServerNotifyApi[K]>): Promise<void> {
    //     return client.sendNotification(method, params);
    // }

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
        },
        clientRequests: {
            addWordsToConfigFileFromServer: true,
            addWordsToDictionaryFileFromServer: true,
            addWordsToVSCodeSettingsFromServer: true,
            onWorkspaceConfigForDocumentRequest: true,
        },
    };

    const rpcApi = createClientSideApi(client, def, { log: () => undefined });

    const api: ServerApi = {
        isSpellCheckEnabled: log2Sfn(rpcApi.serverRequest.isSpellCheckEnabled, 'isSpellCheckEnabled'),
        getConfigurationForDocument: log2Sfn(rpcApi.serverRequest.getConfigurationForDocument, 'getConfigurationForDocument'),
        spellingSuggestions: log2Sfn(rpcApi.serverRequest.spellingSuggestions, 'spellingSuggestions'),
        notifyConfigChange: log2Sfn(rpcApi.serverNotification.notifyConfigChange, 'notifyConfigChange'),
        registerConfigurationFile: log2Sfn(rpcApi.serverNotification.registerConfigurationFile, 'registerConfigurationFile'),
        onSpellCheckDocument: (fn) =>
            createDisposableList([
                onNotify('onSpellCheckDocument', log2Cfn(fn, 'onSpellCheckDocument')),
                rpcApi.clientNotification.onSpellCheckDocument.subscribe(fn),
            ]),
        onWorkspaceConfigForDocumentRequest: (fn) =>
            createDisposableList([
                onRequest('onWorkspaceConfigForDocumentRequest', log2Cfn(fn, 'onWorkspaceConfigForDocumentRequest')),
                rpcApi.clientRequest.onWorkspaceConfigForDocumentRequest.subscribe(fn),
            ]),
        dispose: rpcApi.dispose,
    };

    return api;
}

let reqNum = 0;
const debugCommunication = true;
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

function log2C<P, T>(params: P, value: Promise<T> | T, reqName: string): Promise<T> {
    return logCommunication<P, T>('Client R/N', params, value, reqName, debugClientComms);
}

async function logCommunication<P, T>(kind: string, params: P, value: Promise<T> | T, name: string, log: boolean): Promise<T> {
    const id = ++reqNum;
    let result: T | undefined = undefined;
    log && debugCommunication && console.log('%s %i Start %s: %s(%o)', new Date().toISOString(), id, kind, name, params);
    try {
        result = await value;
        return result;
    } finally {
        log && debugCommunication && console.log('%s %i End   %s: %s, %o', new Date().toISOString(), id, kind, name, result);
    }
}
