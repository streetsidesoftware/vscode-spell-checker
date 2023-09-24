import { getLogLevel } from 'vscode-webview-rpc/logger';

import type { AppState, TodoList } from './apiTypes';
import type { ObservableValue } from './ObservableValue';
import { createStoreValue } from './ObservableValue';

export interface Storage {
    state: ObservableValue<AppState>;
}

export const store: Storage = {
    state: createStoreValue({ seq: 1, logLevel: getLogLevel(), todos: [] }),
};

export const sampleList: TodoList = [
    { uuid: 1, done: false, text: 'finish Svelte tutorial' },
    { uuid: 2, done: false, text: 'build an app' },
    { uuid: 3, done: false, text: 'world domination' },
];
