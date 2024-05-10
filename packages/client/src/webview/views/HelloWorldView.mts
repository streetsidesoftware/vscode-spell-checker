import type { Uri, Webview } from 'vscode';
import { supportedViewsByName } from 'webview-api';

import { AppView } from './AppView.mjs';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class HelloWorldView {
    public static bindView(webview: Webview, extensionUri: Uri): AppView {
        return new AppView(webview, extensionUri, supportedViewsByName['hello-world']);
    }
}
