import { createDisposableList } from 'utils-disposables';
import type { Uri, WebviewPanel } from 'vscode';
import { ViewColumn, window } from 'vscode';

import { HelloWorldView } from '../views/HelloWorldView';

/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class HelloWorldPanel {
    public static currentPanel: HelloWorldPanel | undefined;
    private readonly _panel: WebviewPanel;
    private _disposables = createDisposableList(undefined, 'HelloWorldPanel');

    /**
     * The HelloWorldPanel class private constructor (called only from the render method).
     *
     * @param panel A reference to the webview panel
     * @param extensionUri The URI of the directory containing the extension
     */
    private constructor(panel: WebviewPanel, extensionUri: Uri) {
        this._panel = panel;
        this._disposables.push(this._panel);

        // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
        // the panel or when the panel is closed programmatically)
        this._disposables.push(this._panel.onDidDispose(() => this.dispose()));
        this._disposables.push(HelloWorldView.bindView(this._panel.webview, extensionUri));
    }

    /**
     * Renders the current webview panel if it exists otherwise a new webview panel
     * will be created and displayed.
     *
     * @param extensionUri The URI of the directory containing the extension.
     */
    public static render(extensionUri: Uri) {
        if (HelloWorldPanel.currentPanel) {
            // If the webview panel already exists reveal it
            HelloWorldPanel.currentPanel._panel.reveal(ViewColumn.One);
            return;
        }

        // If a webview panel does not already exist create and show a new one
        const panel = window.createWebviewPanel(
            // Panel view type
            'showHelloWorld',
            // Panel title
            'Hello World',
            // The editor column the panel should be displayed in
            ViewColumn.One,
            // Extra panel configurations
            {}, // set later
        );

        HelloWorldPanel.currentPanel = new HelloWorldPanel(panel, extensionUri);
    }

    /**
     * Cleans up and disposes of webview resources when the webview panel is closed.
     */
    public dispose() {
        if (HelloWorldPanel.currentPanel === this) {
            HelloWorldPanel.currentPanel = undefined;
        }

        // Dispose of the current webview panel
        // this._panel.dispose() is the first element on the list.;

        // Dispose of all disposables (i.e. commands) for the current webview panel
        this._disposables.dispose();
    }
}
