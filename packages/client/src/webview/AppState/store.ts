import { getLogLevel } from 'vscode-webview-rpc/logger';

import type { AppState } from '../apiTypes';
import type { ObservableValue } from './ObservableValue';
import { createStoreValue } from './ObservableValue';

export interface Storage {
    state: ObservableValue<AppState>;
}

export const store: Storage = {
    state: createStoreValue({ seq: 1, logLevel: getLogLevel(), todos: [] }),
};
