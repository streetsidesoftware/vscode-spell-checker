import { createDisposableList, type DisposableLike, disposeOf, injectDisposable, makeDisposable } from 'utils-disposables';
import { createLogger, LogLevel } from 'utils-logger';
import { Uri, window } from 'vscode';
import { type MessageConnection } from 'vscode-jsonrpc/node';
import type { RequestResult, SetValueRequest, SetValueResult, WatchFieldList, WatchFields } from 'webview-api';
import { createServerSideSpellInfoWebviewApi } from 'webview-api';

import type { StoreValue } from '../../Subscribables/StoreValue';
import type { Subscribable } from '../../Subscribables/Subscribables';
import type { ServerSideApi, ServerSideApiDef } from '../apiTypes';
import { awaitSubscribable, getWebviewGlobalStore } from '../AppState';
import { calcDocSettings, type Storage, updateState, watchFieldList } from '../AppState/store';
import { sampleList } from './staticTestData';

export function createApi(connection: MessageConnection) {
    return bindApiAndStore(connection, getWebviewGlobalStore());
}

const logging = {
    ...console,
    // debug: console.log,
};

const logger = createLogger(logging, LogLevel.none);

export function getLogger() {
    return logger;
}

export function bindApiAndStore(connection: MessageConnection, store: Storage): ServerSideApi {
    let watcher: DisposableLike | undefined = undefined;
    const fieldsToWatch = new Set<WatchFields>();
    const disposables = createDisposableList([() => disposeOf(watcher)], 'bindApiAndStore');
    const dispose = disposables.dispose;

    const api: ServerSideApiDef = {
        serverRequests: {
            whatTimeIsIt,
            getLogDebug: () => store.state.logDebug.value,
            getTodos: () => resolveRequest(store.state.todos),
            getCurrentDocument: () => resolveRequest(store.state.currentDocument),
            getDocSettings: calcDocSettings,
            setLogDebug: (r) => (store.state.logDebug.value = r),
            setTodos: (r) => updateStateRequest(r, store.state.todos),
            watchFields,
            resetTodos,
        },
        serverNotifications: {
            async showInformationMessage(message) {
                await window.showInformationMessage('Show Message: ' + message);
            },
            async openTextDocument(url) {
                if (!url) return;
                const uri = Uri.parse(url);
                // console.error('Open %o, %o', url, uri.toJSON());
                await window.showTextDocument(uri);
            },
        },
        clientRequests: {},
        clientNotifications: { onStateChange: true },
    };

    const serverSideApi = createServerSideSpellInfoWebviewApi(connection, api, logger);
    disposables.push(makeDisposable(serverSideApi));

    return injectDisposable({ ...serverSideApi }, dispose, 'bindApiAndStore');

    /** Add fields to be watched. */
    function watchFields(req: WatchFieldList) {
        disposeOf(watcher);
        req.forEach((field) => fieldsToWatch.add(field));
        watcher = watchFieldList(fieldsToWatch, (fields) => {
            // console.warn('Notify fields: %o', fields);
            serverSideApi.clientNotification.onStateChange(fields);
        });
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

function updateStateRequest<T>(r: SetValueRequest<T>, s: StoreValue<T>): SetValueResult<T> {
    return updateState(r.seq, r.value, s);
}

function resolveRequest<T>(s: Subscribable<T>): Promise<RequestResult<T>> {
    return asyncToResultP(awaitSubscribable(s));
}

async function asyncToResultP<T>(value: Promise<T>): Promise<RequestResult<T>> {
    const resolved = await value;
    return toResult(resolved);
}

function toResult<T>(value: T): RequestResult<T> {
    // console.warn('toResult: %o', value);
    return {
        seq: getWebviewGlobalStore().seq,
        value,
    };
}
