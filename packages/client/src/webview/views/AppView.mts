import type { DisposableClassic } from 'utils-disposables';
import { createDisposableList, makeDisposable } from 'utils-disposables';
import type { Webview, WebviewOptions } from 'vscode';
import { Uri } from 'vscode';
import { createConnectionToWebview } from 'vscode-webview-rpc/extension';
import type { SupportedViews } from 'webview-api';
import * as webViewInfo from 'webview-ui';

import { createApi, getLogger } from '../api/index.mjs';
import { getNonce } from '../utilities/getNonce.js';
import { getUri } from '../utilities/getUri.js';

/**
 * This class manages the state and behavior of the webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class AppView {
    private _disposables = createDisposableList(undefined, 'AppView');
    public readonly dispose: DisposableClassic['dispose'] = this._disposables.dispose;

    /**
     * The HelloWorldPanel class private constructor (called only from the render method).
     *
     * @param panel A reference to the webview panel
     * @param extensionUri The URI of the directory containing the extension
     */
    constructor(
        readonly webview: Webview,
        readonly extensionUri: Uri,
        readonly viewName: string,
    ) {
        webview.options = this.calcOptions();

        // Set the HTML content for the webview panel
        webview.html = this._getWebviewContent();

        // Set an event listener to listen for messages passed from the webview context
        const rpc = createConnectionToWebview(webview, getLogger());
        this._disposables.push(makeDisposable(createApi(rpc), 'createApi'));
        rpc.listen();
        this._disposables.push(makeDisposable(rpc, 'rpc'));
    }

    public calcOptions(): WebviewOptions {
        const extensionUri = this.extensionUri;
        return {
            // Enable JavaScript in the webview
            enableScripts: true,
            // Restrict the webview to only load resources from the `out` and `webview-ui/public/build` directories
            localResourceRoots: [
                Uri.joinPath(extensionUri, 'out'),
                Uri.joinPath(extensionUri, 'packages/webview-ui/' + webViewInfo.assetsDir),
            ],
        };
    }

    private webViewUri(path: string): Uri {
        const { webview, extensionUri } = this;
        return getUri(webview, extensionUri, 'packages/webview-ui/', path);
    }

    /**
     * Defines and returns the HTML that should be rendered within the webview panel.
     *
     * @remarks This is also the place where references to the Svelte webview build files
     * are created and inserted into the webview HTML.
     *
     * @param webview A reference to the extension webview
     * @param extensionUri The URI of the directory containing the extension
     * @returns A template string literal containing the HTML that should be
     * rendered within the webview panel
     */
    private _getWebviewContent() {
        const { webview, viewName } = this;
        // The CSS file from the Svelte build output
        const stylesUris = webViewInfo.css.map((file) => this.webViewUri(file));
        const stylesCodiconUri = this.webViewUri(webViewInfo.assetsDir + '/css/codicon.css');
        const allStyleSheets = [...stylesUris, stylesCodiconUri];
        // The JS file from the Svelte build output
        const scriptUri = this.webViewUri(webViewInfo.main);

        const nonce = getNonce();

        function getStylesheetUri(stylesheet: Uri) {
            return /*html*/ `<link rel="stylesheet" type="text/css" nonce="${nonce}" href="${stylesheet}">`;
        }

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Hello World</title>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="
            default-src 'none';
            font-src ${webview.cspSource};
            style-src 'nonce-${nonce}';
            style-src-elem 'nonce-${nonce}';
            script-src 'nonce-${nonce}';
          ">
          <meta property="csp-nonce" content="${nonce}" />
          <meta property="view-name" content="${viewName}" />
          ${allStyleSheets.map(getStylesheetUri).join('\n          ')}
          <script nonce="${nonce}">
            var process = { env: { NODE_ENV: 'production' } };
          </script>
          <script defer nonce="${nonce}" src="${scriptUri}"></script>
        </head>
        <body>
        </body>
      </html>
    `;
    }

    public static bindView(webview: Webview, extensionUri: Uri, viewName: SupportedViews): AppView {
        return new AppView(webview, extensionUri, viewName);
    }
}
