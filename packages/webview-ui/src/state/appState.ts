import type { AppStateData, WatchFieldList, WatchFields } from 'webview-api';

import { getClientApi, getLogger } from '../api';
import {
    type ClientServerStore,
    createClientServerStore,
    createReadonlyClientServerStore,
    type ReadonlyClientServerStore,
    type Subscribable,
} from './store';

const api = getClientApi();

class AppState {
    private csLogDebug: ClientServerStore<AppStateData['logDebug'], 'logDebug'> | undefined;
    private csTodos: ClientServerStore<AppStateData['todos'], 'todos'> | undefined;
    private csCurrentDocument: ReadonlyClientServerStore<AppStateData['currentDocument'], 'currentDocument'> | undefined;

    logDebug() {
        if (this.csLogDebug) {
            return this.csLogDebug.client;
        }
        const cs = createClientServerStore<AppStateData['logDebug'], 'logDebug'>({
            name: 'logDebug',
            initialValue: false,
            query: async () => {
                const value = await api.serverRequest.getLogDebug();
                const logger = getLogger();
                logger.setLogLevelMask(value ? -1 : 0);
                return value;
            },
            watch: watchFields('logDebug'),
            mutate: async (value, set) => set(await api.serverRequest.setLogDebug(value)),
        });
        this.csLogDebug = cs;
        return cs.client;
    }

    todos() {
        if (this.csTodos) {
            return this.csTodos.client;
        }
        const cs = createClientServerStore<AppStateData['todos'], 'todos'>({
            name: 'todos',
            initialValue: [],
            query: async () => (await api.serverRequest.getTodos()).value,
            watch: watchFields('todos'),
            mutate: async (value, set) => set((await api.serverRequest.setTodos({ value })).value),
        });
        this.csTodos = cs;
        return cs.client;
    }

    currentDocument() {
        if (this.csCurrentDocument) {
            return this.csCurrentDocument.client;
        }
        const cs = createReadonlyClientServerStore<AppStateData['currentDocument'], 'currentDocument'>({
            name: 'currentDocument',
            initialValue: null,
            query: async () => (await api.serverRequest.getCurrentDocument()).value,
            watch: watchFields('currentDocument'),
        });
        this.csCurrentDocument = cs;
        return cs.client;
    }

    // docSettings() {
    //     if (this.csDocSettings) {
    //         return this.csDocSettings.client;
    //     }
    //     const cs = createReadonlyClientServerStore<AppStateData['docSettings'], 'docSettings'>({
    //         name: 'docSettings',
    //         initialValue: null,
    //         query: async () => (await api.serverRequest.getDocSettings()).value,
    //         watch: watchFields('docSettings'),
    //     });
    //     this.csDocSettings = cs;
    //     return cs.client;
    // }
}

export const appState = new AppState();

function watchFields(fields: WatchFieldList | WatchFields): Subscribable<void> {
    const fieldsToWatch = new Set(typeof fields === 'string' ? [fields] : fields);

    function isWatched(fields: WatchFieldList): boolean {
        for (const field of fields) {
            if (fieldsToWatch.has(field)) return true;
        }
        return false;
    }

    function subscribe(s: () => void) {
        const disposable = api.clientNotification.onStateChange.subscribe((fields) => isWatched(fields) && s());
        return disposable.dispose;
    }

    logErrors(api.serverRequest.watchFields([...fieldsToWatch]));

    return { subscribe };
}

async function logErrors<T>(p: Promise<T>) {
    try {
        await p;
    } catch (e) {
        console.error(e);
    }
}
