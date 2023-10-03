import type { DisposableClassic, DisposableHybrid } from 'utils-disposables';
import { createDisposableFromList, disposeOf } from 'utils-disposables';
import type { TextDocument, TextEditor, Uri } from 'vscode';
import { window } from 'vscode';
import { getLogLevel, LogLevel, setLogLevel } from 'vscode-webview-rpc/logger';
import type { WatchFieldList, WatchFields } from 'webview-api';

import { getDependencies } from '../../di';
import { calcSettings } from '../../infoViewer/infoHelper';
import type { AppStateData } from '../apiTypes';
import { awaitPromise, delayUnsubscribe, map, pipe, rx, throttle } from './Subscribables';
import { toSubscriberFn } from './Subscribables/helpers/toSubscriber';
import type { MakeSubscribable, StoreValue } from './Subscribables/StoreValue';
import { createStoreValue } from './Subscribables/StoreValue';
import type { Subscribable, SubscriberLike } from './Subscribables/Subscribables';

export interface Storage {
    seq: number;
    state: MakeSubscribable<AppStateData, 'currentDocument' | 'docSettings'>;
    dispose(): void;
}

const debug = false;

debug && setLogLevel(LogLevel.debug);

const writableState = {
    logLevel: createStoreValue(getLogLevel()),
    todos: createStoreValue<AppStateData['todos']>([]),
} as const;

let store: Storage | undefined = undefined;

export function getWebviewGlobalStore(): Storage {
    if (store) return store;

    const currentDocument = rx(subscribeToCurrentDocument, delayUnsubscribe(5000));

    function dispose() {
        const _store = store;
        store = undefined;
        if (!_store) return;
        Object.values(_store.state).forEach((s) => disposeOf(s));
    }

    const _store: Storage = {
        seq: 1,
        state: {
            ...writableState,
            currentDocument,
            docSettings: subscribeToDocSettings(currentDocument),
        },
        dispose,
    };

    return (store = _store);
}

function subscribeToCurrentDocument(subscriber: SubscriberLike<AppStateData['currentDocument']>): DisposableHybrid {
    const emitter = toSubscriberFn(subscriber);
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

function subscribeToDocSettings(src: Subscribable<AppStateData['currentDocument']>): Subscribable<AppStateData['docSettings']> {
    async function calcDocSettings(doc: AppStateData['currentDocument']): Promise<AppStateData['docSettings']> {
        const textDoc = (doc && findMatchTextDocument(doc?.url)) || undefined;
        const di = getDependencies();
        return calcSettings(textDoc, undefined, di.client, console.log);
    }

    return pipe(
        src,
        throttle(1000),
        map(calcDocSettings),
        awaitPromise((err, emitter) => (console.error(err), emitter(null))),
    );
}

export interface StateUpdate<T> {
    seq: number;
    success: boolean;
    value: T;
}

export function updateState<T>(seq: number | undefined, value: T, s: StoreValue<T>): StateUpdate<T> {
    const store = getWebviewGlobalStore();
    if (seq && seq !== store.seq) return { seq: store.seq, value: s.value, success: false };

    store.seq++;
    s.set(value);
    return { seq: store.seq, value: s.value, success: true };
}

export function watchFieldList(fieldsToWatch: Set<WatchFields>, onChange: (changedFields: WatchFieldList) => void): DisposableHybrid {
    const store = getWebviewGlobalStore();
    const list = [...fieldsToWatch];
    const disposables = list
        .map((field) => ({ field, sub: store.state[field] }))
        .map((ss) => {
            return ss.sub.subscribe(() => onChange([ss.field]));
        });

    return createDisposableFromList(disposables);
}

function findMatchTextDocument(url: UrlLike): TextDocument | undefined {
    return findMatchingEditor(url)?.document;
}

function findMatchingEditor(url: UrlLike): TextEditor | undefined {
    for (const editor of window.visibleTextEditors) {
        if (!compareUrl(editor.document.uri, url)) return editor;
    }
    return undefined;
}

type UrlLike = URL | Uri | string;

function compareUrl(a: UrlLike, b: UrlLike): number {
    const aa = normalizeUrlToString(a);
    const bb = normalizeUrlToString(b);
    if (aa === bb) return 0;
    return aa < bb ? -1 : 1;
}

function normalizeUrlToString(url: UrlLike): string {
    const decoded = decodeURIComponent(decodeURIComponent(url.toString())).normalize('NFC');
    return decoded.replace(/^file:\/\/\/[a-z]:/i, (fileUrl) => fileUrl.toLowerCase());
}
