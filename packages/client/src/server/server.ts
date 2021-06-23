import { LanguageClient, NotificationType, RequestType } from 'vscode-languageclient/node';
import { ServerRequestApi, _ServerRequestApi, ServerNotifyApi, ClientNotifications, ClientNotificationsApi } from 'server/api';
export * from 'server/api';

export interface ServerApi extends ServerRequestApi, ServerNotifyApi, ServerEventApi {}

type Disposable = {
    dispose: () => void;
};

type ServerEventApi = {
    [K in keyof ClientNotifications]: (handler: ClientNotificationsApi[K]) => Disposable;
};

export function createServerApi(client: LanguageClient): ServerApi {
    async function sendRequest<K extends keyof ServerRequestApi>(
        method: K,
        param: Parameters<ServerRequestApi[K]>[0]
    ): Promise<ReturnType<_ServerRequestApi[K]>> {
        await client.onReady();
        type R = ReturnType<_ServerRequestApi[K]>;
        const r = new RequestType<Parameters<ServerRequestApi[K]>[0], R, void>(method);
        const result = await client.sendRequest(r, param);
        return result;
    }

    function onNotify<M extends keyof ServerEventApi>(method: M, fn: ClientNotificationsApi[M]) {
        const n = new NotificationType<ClientNotifications[M]>(method);
        return client.onNotification(n, fn);
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
    };

    return api;
}
