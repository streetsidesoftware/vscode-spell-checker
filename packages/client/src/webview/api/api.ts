import { createDisposeMethodFromList, type DisposableLike, injectDisposable } from 'utils-disposables';
import { window } from 'vscode';
import { type MessageConnection } from 'vscode-jsonrpc/node';
import { setLogLevel } from 'vscode-webview-rpc/logger';
import { createServerSideHelloWorldApi } from 'webview-api';

import type { ServerSideApi, ServerSideApiDef } from '../apiTypes';
import { updateAppState } from '../AppState';
import type { Storage } from '../AppState/store';
import { store } from '../AppState/store';
import { log } from '../logger';
import { sampleList } from './staticData';

export function createApi(connection: MessageConnection) {
    return bindApiAndStore(connection, store);
}

export function bindApiAndStore(connection: MessageConnection, store: Storage): ServerSideApi {
    const disposables: DisposableLike[] = [];
    const dispose = createDisposeMethodFromList(disposables);

    const api: ServerSideApiDef = {
        serverRequests: {
            whatTimeIsIt,
            updateAppState,
            getAppState,
            resetTodos,
        },
        serverNotifications: {
            async showInformationMessage(message) {
                await window.showInformationMessage('Show Message: ' + message);
            },
        },
        clientRequests: {},
        clientNotifications: { onChangeAppState: true },
    };

    const serverSideApi = createServerSideHelloWorldApi(connection, api);
    disposables.push(serverSideApi);
    disposables.push(
        store.state.subscribe((v) => {
            setLogLevel(v.logLevel);
            serverSideApi.clientNotification.onChangeAppState(v);
        }),
    );

    return injectDisposable({ ...serverSideApi }, dispose);

    /**
     * Get the time
     */
    async function whatTimeIsIt() {
        return new Date().toString();
    }

    /**
     * Fetch the todo list
     */
    function getAppState() {
        const v = store.state.value;
        log('getAppState, found: %o', v);
        return v;
    }

    /**
     * Reset the Todo list
     */
    function resetTodos() {
        const current = store.state.value;
        updateAppState({ ...current, todos: sampleList.map((todo) => ({ ...todo })) });
    }
}
