import type { ExtensionContext } from 'vscode';
import { commands, window } from 'vscode';

import { HelloWorldPanel } from './panels/HelloWorldPanel';
import { TodoViewProvider } from './providers/TodoViewProvider';

export function activate(context: ExtensionContext) {
    const todoViewProvider = new TodoViewProvider(context.extensionUri);
    const subscriptions = context.subscriptions;

    subscriptions.push(window.registerWebviewViewProvider(TodoViewProvider.viewType, todoViewProvider));

    // Create the show hello world command
    const showHelloWorldCommand = commands.registerCommand('hello-world-svelte.showHelloWorld', () => {
        HelloWorldPanel.render(context.extensionUri);
    });

    // Add command to the extension context
    subscriptions.push(showHelloWorldCommand, { dispose: () => HelloWorldPanel.currentPanel?.dispose() });
}
