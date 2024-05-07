import { createDisposableList } from 'utils-disposables';
import type { Disposable, QuickPickItem, Uri } from 'vscode';
import vscode from 'vscode';

export function registerQuickMenu(): Disposable {
    const dList = createDisposableList();
    dList.push(vscode.commands.registerCommand('cspell.quickMenu.show', quickPickMenu));
    return dList;
}

export class MessageItem implements QuickPickItem {
    label: string;
    description = '';
    detail: string;

    constructor(
        public base: Uri,
        public message: string,
    ) {
        this.label = message.replace(/\r?\n/g, ' ');
        this.detail = base.fsPath;
    }
}

async function quickPickMenu() {
    // const items: QuickPickItem[] = [
    //     { label: 'Item 1', description: 'Description for Item 1' },
    //     { label: 'Item 2', description: 'Description for Item 2' },
    //     { label: 'Item 3', description: 'Description for Item 3' },
    // ];
    // const quickPick = vscode.window.createQuickPick<QuickPickItem>();
    // quickPick.items = items;
    // quickPick.onDidChangeSelection((selection) => {
    //     console.log('onDidChangeSelection', selection);
    // });
    // quickPick.onDidChangeActive((active) => {
    //     console.log('onDidChangeActive', active);
    // });
    // quickPick.onDidAccept(() => {
    //     console.log('onDidAccept');
    // });
    // quickPick.onDidHide(() => {
    //     console.log('onDidHide');
    // });
    // quickPick.show();
}
