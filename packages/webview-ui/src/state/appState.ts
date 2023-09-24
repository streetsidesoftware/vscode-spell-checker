import { log, LogLevel, setLogLevel } from 'vscode-webview-rpc/logger';

import type { AppState } from '../api';
import { getClientApi } from '../api';
import { createClientServerStore, shadowStore } from './store';

setLogLevel(LogLevel.debug);

const csAppState = createClientServerStore<AppState>({ seq: -1, todos: [], logLevel: LogLevel.none });

export const appState = csAppState.client;
export const todos = shadowStore(appState, 'todos');

const api = getClientApi();

// Watch for changes to send to the server
csAppState.server.subscribe(async (v) => {
    if (!v) return;
    const result = await api.serverRequest.updateAppState(v);
    csAppState.server.set(result.value);
});

// Watch for changes from the server
api.clientNotification.onChangeAppState.subscribe((updated) => {
    csAppState.server.set(updated);
    setLogLevel(updated.logLevel);
});

async function initAppState() {
    const state = await api.serverRequest.getAppState();
    log('initAppState %o', state);
    if (state) {
        csAppState.server.set(state);
    }
}

initAppState();
