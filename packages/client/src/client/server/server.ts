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

export interface ServerApi extends ServerNotifyApi, ServerEventApi, RequestsFromServerHandlerApi, Disposable {
    isSpellCheckEnabled: ClientSideApi['serverRequest']['isSpellCheckEnabled'];
    getConfigurationForDocument: ClientSideApi['serverRequest']['getConfigurationForDocument'];
    spellingSuggestions: ClientSideApi['serverRequest']['spellingSuggestions'];
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

type RequestsFromServerHandlerApi = {
    [M in keyof RequestsFromServer]: (handler: Fn<RequestsFromServer[M]>) => Disposable;
};

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

    function sendNotification<K extends keyof ServerNotifyApi>(method: K, ...params: Parameters<ServerNotifyApi[K]>): void {
        client.sendNotification(method, params);
    }

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
        },
    };

    const rpcApi = createClientSideApi(client, def, { log: () => undefined });

    const api: ServerApi = {
        isSpellCheckEnabled: (param) => logReq(rpcApi.serverRequest.isSpellCheckEnabled(param), 'isSpellCheckEnabled'),
        getConfigurationForDocument: (param) =>
            logReq(rpcApi.serverRequest.getConfigurationForDocument(param), 'getConfigurationForDocument'),
        spellingSuggestions: (param) => logReq(rpcApi.serverRequest.spellingSuggestions(param), 'spellingSuggestions'),
        notifyConfigChange: (...params) => sendNotification('notifyConfigChange', ...params),
        registerConfigurationFile: (...params) => sendNotification('registerConfigurationFile', ...params),
        onSpellCheckDocument: (fn) => onNotify('onSpellCheckDocument', fn),
        onWorkspaceConfigForDocumentRequest: (fn) => onRequest('onWorkspaceConfigForDocumentRequest', fn),
        dispose: rpcApi.dispose,
    };

    return api;
}

async function logReq<T>(value: Promise<T>, reqName: string): Promise<T> {
    console.log('%s Start Request: %s', new Date().toISOString(), reqName);
    const r = await value;
    console.log('%s End request: %s, %o', new Date().toISOString(), reqName, r);
    return r;
}
