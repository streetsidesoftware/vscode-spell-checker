import type { Uri, Webview } from 'vscode';

import { AppView } from './AppView';

export class TodoView {
    public static bindView(webview: Webview, extensionUri: Uri): AppView {
        return new AppView(webview, extensionUri, 'todo');
    }
}
