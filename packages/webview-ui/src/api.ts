import { getRpcConnection, getVsCodeApi as rpcGetVsCodeApi } from 'vscode-webview-rpc/webview';
import { type ClientSideApi, createClientSideHelloWorldApi } from 'webview-api';

import type { WebViewState } from './types';

export type { AppState, Todo } from 'webview-api';

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
    const clientSide = createClientSideHelloWorldApi(connection, {
        serverNotifications: {
            showInformationMessage: true,
        },
        serverRequests: {
            whatTimeIsIt: true,
            updateAppState: true,
            getAppState: true,
            resetTodos: true,
        },
        clientNotifications: {
            onChangeAppState: true,
        },
        clientRequests: {},
    });

    connection.listen();

    const api: API = clientSide;

    return api;
}
