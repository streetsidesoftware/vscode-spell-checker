import type {
    ClientNotifications,
    ClientNotificationsApi,
    Fn,
    Req,
    RequestResponseFn,
    RequestsToClient,
    Res,
    ServerMethods,
    ServerNotifyApi,
    ServerRequestApi,
} from 'server/api';
import { LanguageClient, NotificationType, RequestType } from 'vscode-languageclient/node';
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
    CSpellUserSettingsWithComments,
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
} from 'server/api';

export interface ServerApi extends ServerRequestApi, ServerNotifyApi, ServerEventApi, RequestsFromServerHandlerApi {}

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

export function createServerApi(client: LanguageClient): ServerApi {
    async function sendRequest<M extends keyof ServerMethods>(method: M, param: Req<ServerMethods[M]>): Promise<Res<ServerMethods[M]>> {
        await client.onReady();
        const r = new RequestType<Req<ServerMethods[M]>, Res<ServerMethods[M]>, void>(method);
        const result = await client.sendRequest(r, param);
        return result;
    }

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

    const api: ServerApi = {
        isSpellCheckEnabled: (param) => sendRequest('isSpellCheckEnabled', param),
        getConfigurationForDocument: (param) => sendRequest('getConfigurationForDocument', param),
        splitTextIntoWords: (param) => sendRequest('splitTextIntoWords', param),
        spellingSuggestions: (param) => sendRequest('spellingSuggestions', param),
        matchPatternsInDocument: (param) => sendRequest('matchPatternsInDocument', param),
        notifyConfigChange: (...params) => sendNotification('notifyConfigChange', ...params),
        registerConfigurationFile: (...params) => sendNotification('registerConfigurationFile', ...params),
        onSpellCheckDocument: (fn) => onNotify('onSpellCheckDocument', fn),
        onWorkspaceConfigForDocumentRequest: (fn) => onRequest('onWorkspaceConfigForDocumentRequest', fn),
    };

    return api;
}
