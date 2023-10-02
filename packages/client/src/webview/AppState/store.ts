import type { DisposableClassic, DisposableHybrid } from 'utils-disposables';
import { createDisposableFromList } from 'utils-disposables';
import type { TextEditor } from 'vscode';
import { window } from 'vscode';
import { getLogLevel, LogLevel, setLogLevel } from 'vscode-webview-rpc/logger';
import type { WatchFieldList, WatchFields } from 'webview-api';

import type { AppStateData } from '../apiTypes';
import { createSubscribable } from './Subscribables/functions';
import type { MakeSubscribable, StoreValue } from './Subscribables/StoreValue';
import { createStoreValue } from './Subscribables/StoreValue';
import type { SubscriberFn } from './Subscribables/Subscribables';

export interface Storage {
    seq: number;
    state: MakeSubscribable<AppStateData, 'currentDocument' | 'docSettings'>;
}

const debug = false;

debug && setLogLevel(LogLevel.debug);

const writableState = {
    logLevel: createStoreValue(getLogLevel()),
    todos: createStoreValue<AppStateData['todos']>([]),
} as const;

export const store: Storage = {
    seq: 1,
    state: {
        ...writableState,
        currentDocument: createSubscribable(subscribeToCurrentDocument),
        docSettings: createSubscribable(subscribeToDocSettings),
    },
};

function subscribeToCurrentDocument(emitter: SubscriberFn<AppStateData['currentDocument']>): DisposableHybrid {
    const disposables: DisposableClassic[] = [];
    const disposable = createDisposableFromList(disposables);

    setCurrentDocument(window.activeTextEditor);
    window.onDidChangeActiveTextEditor(setCurrentDocument, undefined, disposables);
    window.onDidChangeTextEditorSelection(
        (event) => event.textEditor === window.activeTextEditor && setCurrentDocument(event.textEditor),
        undefined,
        disposables,
    );

    return disposable;

    function setCurrentDocument(textEditor: TextEditor | undefined) {
        if (!textEditor) {
            emitter(null);
            return;
        }

        const document = textEditor.document;
        const doc = {
            url: document.uri.toString(),
            version: document.version,
        };

        emitter(doc);
    }
}

function subscribeToDocSettings(_emitter: SubscriberFn<AppStateData['docSettings']>): DisposableHybrid {
    const disposables: DisposableClassic[] = [];
    const disposable = createDisposableFromList(disposables);

    return disposable;
}

export interface StateUpdate<T> {
    seq: number;
    success: boolean;
    value: T;
}

export function updateState<T>(seq: number | undefined, value: T, s: StoreValue<T>): StateUpdate<T> {
    if (seq && seq !== store.seq) return { seq: store.seq, value: s.value, success: false };

    store.seq++;
    s.set(value);
    return { seq: store.seq, value: s.value, success: true };
}

export function watchFieldList(fieldsToWatch: Set<WatchFields>, onChange: (changedFields: WatchFieldList) => void): DisposableHybrid {
    const list = [...fieldsToWatch];
    const disposables = list
        .map((field) => ({ field, sub: store.state[field] }))
        .map((ss) => {
            return ss.sub.subscribe(() => onChange([ss.field]));
        });

    return createDisposableFromList(disposables);
}
