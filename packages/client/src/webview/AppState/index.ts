import type { DisposableClassic } from 'utils-disposables';
import { createDisposableFromList } from 'utils-disposables';
import type { Disposable, ExtensionContext, TextEditor } from 'vscode';
import { window } from 'vscode';
import type { AppState, UpdateResult } from 'webview-api';

import { store } from './store';

export function bindToEvents(_context: ExtensionContext): Disposable {
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
}

function setCurrentDocument(textEditor: TextEditor | undefined) {
    if (!textEditor) {
        updateAppState({ currentDocument: undefined }, false);
        return;
    }

    const document = textEditor.document;
    const doc = {
        url: document.uri.toString(),
        version: document.version,
    };

    updateAppState({ currentDocument: doc }, false);
}

/**
 * Update the todo list
 */
export function updateAppState(state: Partial<AppState>, fromClient = true): UpdateResult<AppState> {
    let success = false;

    function update(current: AppState): AppState {
        if (fromClient && current.seq !== state.seq) return current;
        const { currentDocument } = current;
        const next = fromClient ? { ...current, ...state, currentDocument } : { ...current, ...state };
        ++next.seq;
        success = true;
        return next;
    }

    store.state.update(update);
    return { success, value: store.state.value };
}
