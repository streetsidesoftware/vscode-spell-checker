import { LanguageClient } from 'vscode-languageclient/node';
import {
    ServerRequestApi,
    ServerNotifyApi,
    ServerRequestMethodRequests,
    ServerRequestMethodResults,
    NotifyServerMethodParams,
} from 'server/api';
export * from 'server/api';

export interface ServerApi extends ServerRequestApi, ServerNotifyApi {}

export function createServerApi(client: LanguageClient): ServerApi {
    async function sendRequest<K extends keyof ServerRequestApi>(
        method: K,
        param: ServerRequestMethodRequests[K]
    ): Promise<ServerRequestMethodResults[K]> {
        await client.onReady();
        return client.sendRequest(method, param);
    }

    function sendNotification<K extends keyof ServerNotifyApi>(method: K, ...params: Parameters<ServerNotifyApi[K]>): void {
        client.sendNotification(method, params);
    }

    const api: ServerApi = {
        isSpellCheckEnabled: (param: ServerRequestMethodRequests['isSpellCheckEnabled']) => sendRequest('isSpellCheckEnabled', param),
        getConfigurationForDocument: (param: ServerRequestMethodRequests['getConfigurationForDocument']) =>
            sendRequest('getConfigurationForDocument', param),
        splitTextIntoWords: (param: ServerRequestMethodRequests['splitTextIntoWords']) => sendRequest('splitTextIntoWords', param),
        spellingSuggestions: (param: ServerRequestMethodRequests['spellingSuggestions']) => sendRequest('spellingSuggestions', param),
        matchPatternsInDocument: (param: ServerRequestMethodRequests['matchPatternsInDocument']) =>
            sendRequest('matchPatternsInDocument', param),
        onConfigChange: (...params: NotifyServerMethodParams['onConfigChange']) => sendNotification('onConfigChange', ...params),
        registerConfigurationFile: (...params: NotifyServerMethodParams['registerConfigurationFile']) =>
            sendNotification('registerConfigurationFile', ...params),
    };

    return api;
}
