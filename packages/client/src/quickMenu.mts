import { isDefined } from '@internal/common-utils';
import { createDisposableList } from 'utils-disposables';
import type { Disposable, QuickPickItem } from 'vscode';
import vscode from 'vscode';

import { knownCommands } from './commands.mjs';
import { logErrors } from './util/errors.js';

export interface ActionsMenuOptions {
    areIssuesVisible: () => boolean;
}

export function registerActionsMenu(options: ActionsMenuOptions): Disposable {
    const dList = createDisposableList();
    dList.push(vscode.commands.registerCommand('cspell.showActionsMenu', () => quickPickMenu(options)));
    return dList;
}

interface ActionMenuItem extends QuickPickItem {
    action?: (() => void | Promise<void>) | undefined;
}

export class MenuItem implements ActionMenuItem {
    #action?: (() => void | Promise<void>) | undefined;
    kind?: QuickPickItem['kind'] | undefined;
    detail?: string | undefined;
    picked?: boolean | undefined;
    iconPath?: QuickPickItem['iconPath'] | undefined;
    alwaysShow?: boolean | undefined;
    buttons?: readonly vscode.QuickInputButton[] | undefined;
    constructor(
        public label: string,
        public description?: string,
        action?: (() => void | Promise<void>) | undefined,
    ) {
        this.#action = action;
    }

    action() {
        return this.#action?.();
    }
}

export class CommandMenuItem extends MenuItem {
    constructor(
        readonly command: vscode.Command,
        public description?: string,
    ) {
        super(command.title, description);
    }

    async action() {
        await vscode.commands.executeCommand(this.command.command, ...(this.command.arguments || []));
    }
}

async function quickPickMenu(options: ActionsMenuOptions) {
    const items: QuickPickItem[] = [
        menuItem('Item 1', 'Description for Item 1'),
        menuItem('Item 2', 'Description for Item 2'),
        { label: '', kind: vscode.QuickPickItemKind.Separator },
        itemIssuesShowHide(options),
        menuItem({ label: '$(book) Dictionaries...' }),
        itemCommand({ title: '$(file) Show File Info...', command: knownCommands['cSpell.openFileInfoView'] }),
        itemCommand({ title: '$(console) Open Spell Checker REPL Console.', command: knownCommands['cSpell.createCSpellTerminal'] }),
        itemCommand({ title: '$(issues) Open Spelling Issues Panel.', command: 'cSpell.openIssuesPanel' }),
        itemSeparator(),
        itemCommand({
            title: '$(keyboard) Edit Keyboard Shortcuts...',
            command: 'workbench.action.openGlobalKeybindings',
            arguments: ['Spell:'],
        }),
        itemCommand({ title: '$(gear) Edit Settings...', command: 'workbench.action.openSettings', arguments: ['cSpell'] }),
    ].filter(isDefined);
    const quickPick = vscode.window.createQuickPick<QuickPickItem>();
    quickPick.title = 'Spell Checker Actions Menu';
    quickPick.items = items;
    quickPick.onDidChangeSelection((selection) => {
        console.log('onDidChangeSelection', selection);
    });
    quickPick.onDidChangeActive((active) => {
        console.log('onDidChangeActive', active);
    });
    quickPick.onDidAccept(() => {
        console.log('onDidAccept', quickPick.activeItems);
        const item = quickPick.activeItems[0];
        if (item instanceof MenuItem && item.action) {
            logErrors(Promise.resolve(item.action()), 'quickPickMenu');
        }
        quickPick.dispose();
    });
    quickPick.onDidHide(() => {
        console.log('onDidHide');
    });
    quickPick.show();
}

function menuItem(item: QuickPickItem): MenuItem;
function menuItem(label: string, description?: string): MenuItem;
function menuItem(labelOrItem: string | QuickPickItem, description?: string): MenuItem {
    if (typeof labelOrItem === 'string') return new MenuItem(labelOrItem, description);
    const item = new MenuItem(labelOrItem.label, labelOrItem.description);
    item.kind = labelOrItem.kind;
    item.iconPath = labelOrItem.iconPath;
    item.alwaysShow = labelOrItem.alwaysShow;
    item.buttons = labelOrItem.buttons;
    item.detail = labelOrItem.detail;
    item.picked = labelOrItem.picked;
    return item;
}

function itemCommand(command: vscode.Command, description?: string) {
    return new CommandMenuItem(command, description);
}

function itemSeparator(): QuickPickItem {
    return { label: '', kind: vscode.QuickPickItemKind.Separator };
}

function itemIssuesShowHide(options: Pick<ActionsMenuOptions, 'areIssuesVisible'>) {
    const visible = options.areIssuesVisible();
    return visible
        ? itemCommand({ title: '$(eye-closed) Hide Spelling Issues', command: 'cSpell.hide' })
        : itemCommand({ title: '$(eye) Show Spelling Issues', command: 'cSpell.show' });
}
