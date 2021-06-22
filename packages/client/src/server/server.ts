import { LanguageClient, RequestType } from 'vscode-languageclient/node';
import { ServerRequestApi, _ServerRequestApi, ServerNotifyApi } from 'server/api';
export * from 'server/api';

export interface ServerApi extends ServerRequestApi, ServerNotifyApi {}

type ServerMethodParams<method extends keyof ServerApi> = Parameters<ServerApi[method]>;

export function createServerApi(client: LanguageClient): ServerApi {
    async function sendRequest<K extends keyof ServerRequestApi>(
        method: K,
        params: Parameters<ServerRequestApi[K]>
    ): Promise<ReturnType<_ServerRequestApi[K]>> {
        await client.onReady();
        type R = ReturnType<_ServerRequestApi[K]>;
        const r = new RequestType<Parameters<ServerRequestApi[K]>, R, void>(method);
        return client.sendRequest(r, params);
    }

    function sendNotification<K extends keyof ServerNotifyApi>(method: K, ...params: Parameters<ServerNotifyApi[K]>): void {
        client.sendNotification(method, params);
    }

    const api: ServerApi = {
        isSpellCheckEnabled: (...params: ServerMethodParams<'isSpellCheckEnabled'>) => sendRequest('isSpellCheckEnabled', params),
        getConfigurationForDocument: (...params: ServerMethodParams<'getConfigurationForDocument'>) =>
            sendRequest('getConfigurationForDocument', params),
        splitTextIntoWords: (...params: ServerMethodParams<'splitTextIntoWords'>) => sendRequest('splitTextIntoWords', params),
        spellingSuggestions: (...params: ServerMethodParams<'spellingSuggestions'>) => sendRequest('spellingSuggestions', params),
        matchPatternsInDocument: (...params: ServerMethodParams<'matchPatternsInDocument'>) =>
            sendRequest('matchPatternsInDocument', params),
        onConfigChange: (...params: ServerMethodParams<'onConfigChange'>) => sendNotification('onConfigChange', ...params),
        registerConfigurationFile: (...params: ServerMethodParams<'registerConfigurationFile'>) =>
            sendNotification('registerConfigurationFile', ...params),
    };

    return api;
}
