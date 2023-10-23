import type { DisposableClassic, DisposableHybrid, DisposableLike } from 'utils-disposables';
import { createDisposable, createDisposableFromList, disposeOf, injectDisposable } from 'utils-disposables';
import { LogLevelMasks } from 'utils-logger';
import type { TextDocument, TextEditor, Uri } from 'vscode';
import { window } from 'vscode';
import type { WatchFieldList, WatchFields } from 'webview-api';

import { getDependencies } from '../../di';
import { calcSettings } from '../../infoViewer/infoHelper';
import { createSubscribableView, pipe, rx, throttle } from '../../Subscribables';
import { toSubscriberFn } from '../../Subscribables/helpers/toSubscriber';
import type { MakeSubscribable, StoreValue } from '../../Subscribables/StoreValue';
import { createStoreValue } from '../../Subscribables/StoreValue';
import type { SubscriberLike } from '../../Subscribables/Subscribables';
import { getLogger } from '../api/api';
import type { AppStateData } from '../apiTypes';

export interface Storage {
    seq: number;
    state: MakeSubscribable<AppStateData, 'currentDocument'>;
    dispose(): void;
}

const debug = false;

debug && getLogger().setLogLevelMask(LogLevelMasks.everything);

let store: Storage | undefined = undefined;

export function getWebviewGlobalStore(): Storage {
    if (store) return store;

    const currentDocumentSub = rx(subscribeToCurrentDocument);
    const currentDocument = pipe(currentDocumentSub, throttle(500), /* delayUnsubscribe(5000), */ createSubscribableView);
    // currentDocument.onEvent('onNotify', (event) => console.log('current document update: %o', event));

    function dispose() {
        disposeOf(currentDocumentSub);
        const _store = store;
        store = undefined;
        if (!_store) return;
        Object.values(_store.state).forEach((s) => disposeOf(s));
    }

    const writableState = {
        logDebug: createStoreValue(getLogger().isMethodEnabled('debug')),
        todos: createStoreValue<AppStateData['todos']>([]),
    } as const;

    const _store: Storage = injectDisposable(
        {
            seq: 1,
            state: {
                ...writableState,
                currentDocument,
            },
        },
        dispose,
        'getWebviewGlobalStore',
    );

    return (store = _store);
}

function subscribeToCurrentDocument(subscriber: SubscriberLike<AppStateData['currentDocument']>): DisposableHybrid {
    const emitter = toSubscriberFn(subscriber);
    const disposables: DisposableLike[] = [];
    const disposable = createDisposableFromList(disposables);

    setCurrentDocument(window.activeTextEditor);
    disposables.push(disposeClassic(window.onDidChangeActiveTextEditor(setCurrentDocument, undefined)));
    disposables.push(
        disposeClassic(
            window.onDidChangeTextEditorSelection(
                (event) => event.textEditor === window.activeTextEditor && setCurrentDocument(event.textEditor),
                undefined,
            ),
        ),
    );

    return disposable;

    function setCurrentDocument(textEditor: TextEditor | undefined) {
        if (!textEditor) {
            // emitter(null);
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

export async function calcDocSettings(doc?: string) {
    const textDoc = (doc && findMatchTextDocument(doc)) || undefined;
    const di = getDependencies();
    return calcSettings(textDoc, undefined, di.client, console.log);
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

function disposeClassic(disposable: DisposableClassic): DisposableHybrid {
    return createDisposable(() => disposable.dispose(), undefined, 'disposeClassic');
}
