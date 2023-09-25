import { createDisposeMethodFromList, type DisposableLike, disposeOf, injectDisposable } from 'utils-disposables';
import { window } from 'vscode';
import { type MessageConnection } from 'vscode-jsonrpc/node';
import type { RequestResult, SetValueRequest, SetValueResult, WatchFieldList } from 'webview-api';
import { createServerSideSpellInfoWebviewApi } from 'webview-api';

import type { ServerSideApi, ServerSideApiDef } from '../apiTypes';
import { awaitForSubscribable, store } from '../AppState';
import type { ObservableValue, SubscribableValue } from '../AppState/ObservableValue';
import { type Storage, updateState, watchFieldList } from '../AppState/store';
import { sampleList } from './staticData';

export function createApi(connection: MessageConnection) {
    return bindApiAndStore(connection, store);
}

export function bindApiAndStore(connection: MessageConnection, store: Storage): ServerSideApi {
    let watcher: DisposableLike | undefined = undefined;
    const disposables: DisposableLike[] = [() => disposeOf(watcher)];
    const dispose = createDisposeMethodFromList(disposables);

    const api: ServerSideApiDef = {
        serverRequests: {
            whatTimeIsIt,
            getLogLevel: () => resolveRequest(store.state.logLevel),
            getTodos: () => resolveRequest(store.state.todos),
            getCurrentDocument: () => resolveRequest(store.state.currentDocument),
            setLogLevel: (r) => updateStateRequest(r, store.state.logLevel),
            setTodos: (r) => updateStateRequest(r, store.state.todos),
            watchState,
            resetTodos,
        },
        serverNotifications: {
            async showInformationMessage(message) {
                await window.showInformationMessage('Show Message: ' + message);
            },
        },
        clientRequests: {},
        clientNotifications: { onStateChange: true },
    };

    const serverSideApi = createServerSideSpellInfoWebviewApi(connection, api);
    disposables.push(serverSideApi);

    return injectDisposable({ ...serverSideApi }, dispose);

    function watchState(req: WatchFieldList) {
        disposeOf(watcher);
        watcher = watchFieldList(req, (fields) => serverSideApi.clientNotification.onStateChange(fields));
    }

    /**
     * Get the time
     */
    function whatTimeIsIt() {
        return new Date().toString();
    }

    /**
     * Reset the Todo list
     */
    function resetTodos() {
        return updateState(
            undefined,
            sampleList.map((todo) => ({ ...todo })),
            store.state.todos,
        );
    }
}

function updateStateRequest<T>(r: SetValueRequest<T>, s: ObservableValue<T>): SetValueResult<T> {
    return updateState(r.seq, r.value, s);
}

function resolveRequest<T>(s: SubscribableValue<T>): Promise<RequestResult<T>> {
    return asyncToResultP(awaitForSubscribable(s));
}

async function asyncToResultP<T>(value: Promise<T>): Promise<RequestResult<T>> {
    return toResult(await value);
}

function toResult<T>(value: T): RequestResult<T> {
    return {
        seq: store.seq,
        value,
    };
}
