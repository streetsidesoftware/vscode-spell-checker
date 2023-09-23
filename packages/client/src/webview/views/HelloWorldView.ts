import type { Uri, Webview } from 'vscode';

import { AppView } from './AppView';

export class HelloWorldView {
    public static bindView(webview: Webview, extensionUri: Uri): AppView {
        return new AppView(webview, extensionUri, 'hello-world');
    }
}
