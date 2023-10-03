import type { ExtensionContext } from 'vscode';
import { commands, window } from 'vscode';
import { supportedViewsByName } from 'webview-api';

import { getWebviewGlobalStore } from './AppState/store';
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

    const views = [
        new TodoViewProvider(extensionUri),
        new WebviewApiViewProvider(extensionUri, supportedViewsByName['cspell-info'], 'cspell-info.infoView'),
    ];

    for (const view of views) {
        subscriptions.push(window.registerWebviewViewProvider(view.viewType, view));
    }

    // Create the show hello world command
    const showHelloWorldCommand = commands.registerCommand(rCommands['cspell-info.showHelloWorld'], () => {
        HelloWorldPanel.render(context.extensionUri);
    });

    // Add command to the extension context
    subscriptions.push(showHelloWorldCommand, { dispose: () => HelloWorldPanel.currentPanel?.dispose() });

    // Add state clean up.
    subscriptions.push(getWebviewGlobalStore());
}
