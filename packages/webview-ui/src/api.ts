import { getRpcConnection, getVsCodeApi as rpcGetVsCodeApi } from 'vscode-webview-rpc/webview';
import { type ClientSideApi, createClientSideSpellInfoWebviewApi } from 'webview-api';

import type { WebViewState } from './types';

export type { Todo } from 'webview-api';
export { supportedViewsByName } from 'webview-api';

export interface API extends ClientSideApi {}

let _api: API | undefined;

export function getClientApi(): API {
    if (_api) return _api;
    _api = createApi();
    return _api;
}

export function getVsCodeApi() {
    return rpcGetVsCodeApi<WebViewState>();
}

export function getLocalState(): WebViewState | undefined {
    return getVsCodeApi().getState();
}

export function setLocalState(state: WebViewState) {
    return getVsCodeApi().setState(state);
}

function createApi(): API {
    const connection = getRpcConnection();
    const clientSide = createClientSideSpellInfoWebviewApi(connection, {
        serverNotifications: {
            showInformationMessage: true,
        },
        serverRequests: {
            getCurrentDocument: true,
            getDocSettings: true,
            getLogLevel: true,
            getTodos: true,
            resetTodos: true,
            setLogLevel: true,
            setTodos: true,
            watchFields: true,
            whatTimeIsIt: true,
        },
        clientNotifications: {
            onStateChange: true,
        },
        clientRequests: {},
    });

    connection.listen();

    const api: API = clientSide;

    return api;
}
