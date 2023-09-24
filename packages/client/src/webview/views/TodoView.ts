import type { Uri, Webview } from 'vscode';
import { supportedViewsByName } from 'webview-api';

import { AppView } from './AppView';

export class TodoView {
    public static bindView(webview: Webview, extensionUri: Uri): AppView {
        return new AppView(webview, extensionUri, supportedViewsByName.todo);
    }
}
