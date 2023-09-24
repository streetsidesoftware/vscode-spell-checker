import type { CancellationToken, Uri, WebviewView, WebviewViewProvider, WebviewViewResolveContext } from 'vscode';

import { TodoView } from '../views/TodoView';

export class TodoViewProvider implements WebviewViewProvider {
    public readonly viewType: string = 'cspell-info.todoView';

    private _view?: WebviewView;

    constructor(private readonly extensionUri: Uri) {}

    public resolveWebviewView(webviewView: WebviewView, _context: WebviewViewResolveContext, _token: CancellationToken) {
        this._view = webviewView;
        const appView = TodoView.bindView(webviewView.webview, this.extensionUri);
        this._view.onDidDispose(() => appView.dispose());
    }
}
