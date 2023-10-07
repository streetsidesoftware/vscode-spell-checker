import type { LoggerWithLogLevel } from 'utils-logger';
import { createLogger, LogLevel } from 'utils-logger';
import { getRpcConnection, getVsCodeApi as rpcGetVsCodeApi } from 'vscode-webview-rpc/webview';
import { type ClientSideApi, createClientSideSpellInfoWebviewApi } from 'webview-api';

import type { WebViewState } from './types';

export type { Todo } from 'webview-api';
export { supportedViewsByName } from 'webview-api';

export interface API extends ClientSideApi {}

const logger = createLogger(console, LogLevel.none);

let _api: API | undefined;

export function getClientApi(): API {
    if (_api) return _api;
    _api = createApi();
    return _api;
}

export function getLogger(): LoggerWithLogLevel {
    return logger;
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
    const clientSide = createClientSideSpellInfoWebviewApi(
        connection,
        {
            serverNotifications: {
                showInformationMessage: true,
                openTextDocument: true,
            },
            serverRequests: {
                getCurrentDocument: true,
                getDocSettings: true,
                getLogDebug: true,
                getTodos: true,
                resetTodos: true,
                setLogDebug: true,
                setTodos: true,
                watchFields: true,
                whatTimeIsIt: true,
            },
            clientNotifications: {
                onStateChange: true,
            },
            clientRequests: {},
        },
        logger,
    );

    connection.listen();

    const api: API = clientSide;

    return api;
}
