import type { AppStateData, WatchFieldList, WatchFields } from 'webview-api';
import { LogLevel, setLogLevel } from 'webview-api';

import { getClientApi } from '../api';
import {
    type ClientServerStore,
    createClientServerStore,
    createReadonlyClientServerStore,
    type ReadonlyClientServerStore,
    type Subscribable,
} from './store';

const api = getClientApi();

class AppState {
    private csLogLevel: ClientServerStore<AppStateData['logLevel'], 'logLevel'> | undefined;
    private csTodos: ClientServerStore<AppStateData['todos'], 'todos'> | undefined;
    private csCurrentDocument: ReadonlyClientServerStore<AppStateData['currentDocument'], 'currentDocument'> | undefined;

    logLevel() {
        if (this.csLogLevel) {
            return this.csLogLevel.client;
        }
        const cs = createClientServerStore<AppStateData['logLevel'], 'logLevel'>({
            name: 'logLevel',
            initialValue: LogLevel.none,
            query: async () => {
                const value = (await api.serverRequest.getLogLevel()).value;
                setLogLevel(value);
                return value;
            },
            watch: watchFields('logLevel'),
            mutate: async (value, set) => set((await api.serverRequest.setLogLevel({ value })).value),
        });
        this.csLogLevel = cs;
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
