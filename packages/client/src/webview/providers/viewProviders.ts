import type { CancellationToken, Uri, WebviewView, WebviewViewProvider, WebviewViewResolveContext } from 'vscode';
import type { SupportedViews } from 'webview-api';

import { AppView } from '../views/AppView';

export class WebviewApiViewProvider implements WebviewViewProvider {
    private _view?: WebviewView;

    constructor(
        private readonly extensionUri: Uri,
        readonly viewName: SupportedViews,
        readonly viewType: string,
    ) {}

    public resolveWebviewView(webviewView: WebviewView, _context: WebviewViewResolveContext, _token: CancellationToken) {
        this._view = webviewView;
        const appView = AppView.bindView(webviewView.webview, this.extensionUri, this.viewName);
        this._view.onDidDispose(() => appView.dispose());
    }
}
