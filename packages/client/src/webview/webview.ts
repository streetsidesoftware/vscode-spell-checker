import type { ExtensionContext } from 'vscode';
import { commands, window } from 'vscode';
import { supportedViewsByName } from 'webview-api';

import { getWebviewGlobalStore } from './AppState';
// import { getWebviewGlobalStore } from './AppState/store';
import { HelloWorldPanel } from './panels/HelloWorldPanel';
import { TodoViewProvider } from './providers/TodoViewProvider';
import { WebviewApiViewProvider } from './providers/viewProviders';

export const registeredCommands = ['cspell-info.showHelloWorld'] as const;

type CommandNames = (typeof registeredCommands)[number];

type RegisteredCommandNames = {
    [P in CommandNames]: P;
};

const rCommands = Object.fromEntries(registeredCommands.map((name) => [name, name] as const)) as RegisteredCommandNames;

export function activate(context: ExtensionContext) {
    const { subscriptions, extensionUri } = context;

    // subscriptions.push(debugDispose('Dispose Activate 0'));

    const views = [
        new TodoViewProvider(extensionUri),
        new WebviewApiViewProvider(extensionUri, supportedViewsByName['cspell-info'], 'cspell-info.infoView'),
    ];

    for (const view of views) {
        subscriptions.push(window.registerWebviewViewProvider(view.viewType, view));
    }

    // subscriptions.push(debugDispose('Dispose Activate 1'));

    // Create the show hello world command
    const showHelloWorldCommand = commands.registerCommand(rCommands['cspell-info.showHelloWorld'], () => {
        HelloWorldPanel.render(context.extensionUri);
    });

    // subscriptions.push(debugDispose('Dispose Activate 2'));

    // Add command to the extension context
    subscriptions.push(showHelloWorldCommand, { dispose: () => HelloWorldPanel.currentPanel?.dispose() });

    // subscriptions.push(debugDispose('Dispose Activate 3'));

    // Add state clean up.
    subscriptions.push(getWebviewGlobalStore());

    // subscriptions.push(debugDispose('Dispose Activate 4'));
}

// function debugDispose(name: string) {
//     return createDisposable(() => console.error(name), undefined, name);
// }
