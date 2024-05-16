import { isDefined } from '@internal/common-utils';
import { createDisposableList } from 'utils-disposables';
import type { Disposable, QuickPickItem } from 'vscode';
import vscode from 'vscode';

import { knownCommands } from './commands.mjs';
import { getClient } from './di.mjs';
import { updateEnabledFileTypeForResource, updateEnabledSchemesResource } from './settings/settings.mjs';
import { handleErrors, logErrors } from './util/errors.js';

export interface ActionsMenuOptions {
    areIssuesVisible: () => boolean;
}

export function registerActionsMenu(options: ActionsMenuOptions): Disposable {
    const dList = createDisposableList();
    dList.push(vscode.commands.registerCommand('cspell.showActionsMenu', () => quickPickMenu(options)));
    return dList;
}

interface ActionMenuItem extends QuickPickItem {
    resourceUri?: vscode.Uri;
    action?: (() => void | Promise<void>) | undefined;
}

async function quickPickMenu(options: ActionsMenuOptions) {
    const document = vscode.window.activeTextEditor?.document;
    const isEnabledForDoc = await handleErrors(
        document ? getClient().getConfigurationForDocument(document, {}) : Promise.resolve(undefined),
        'Language Status',
    );

    const items: QuickPickItem[] = [
        // menuItem('Item 1', 'Description for Item 1'),
        // menuItem('Item 2', 'Description for Item 2'),
        itemDocFileType(document?.uri, isEnabledForDoc?.languageId, isEnabledForDoc?.languageIdEnabled),
        itemDocScheme(document?.uri, isEnabledForDoc?.schemeIsAllowed),
        ...itemsConfigFiles(isEnabledForDoc?.configFiles.map((uri) => vscode.Uri.parse(uri))),
        { label: '', kind: vscode.QuickPickItemKind.Separator },
        itemIssuesShowHide(options),
        // menuItem({ label: '$(book) Dictionaries...' }),
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

class MenuItem implements ActionMenuItem {
    #action: () => void | Promise<void>;
    kind?: QuickPickItem['kind'] | undefined;
    detail?: string | undefined;
    picked?: boolean | undefined;
    iconPath?: QuickPickItem['iconPath'] | undefined;
    alwaysShow?: boolean | undefined;
    buttons?: readonly vscode.QuickInputButton[] | undefined;
    resourceUri?: vscode.Uri | undefined;
    constructor(
        public label: string,
        public description?: string,
        action?: (() => void | Promise<void>) | undefined,
    ) {
        this.#action = action || (() => undefined);
    }

    get action() {
        return this.#action;
    }

    set action(fn: () => void | Promise<void>) {
        this.#action = fn;
    }
}

class CommandMenuItem extends MenuItem {
    constructor(
        readonly command: vscode.Command,
        public description?: string,
    ) {
        super(command.title, description, async () => {
            await vscode.commands.executeCommand(this.command.command, ...(this.command.arguments || []));
        });
    }
}

// function menuItem(item: QuickPickItem): MenuItem;
// function menuItem(label: string, description?: string): MenuItem;
// function menuItem(labelOrItem: string | QuickPickItem, description?: string): MenuItem {
//     if (typeof labelOrItem === 'string') return new MenuItem(labelOrItem, description);
//     const item = new MenuItem(labelOrItem.label, labelOrItem.description);
//     item.kind = labelOrItem.kind;
//     item.iconPath = labelOrItem.iconPath;
//     item.alwaysShow = labelOrItem.alwaysShow;
//     item.buttons = labelOrItem.buttons;
//     item.detail = labelOrItem.detail;
//     item.picked = labelOrItem.picked;
//     return item;
// }

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

function itemDocFileType(uri: vscode.Uri | undefined, fileType: string | undefined, enabled: boolean | undefined) {
    if (!fileType || enabled === undefined) return undefined;
    const icon = enabled ? '$(code)' : '$(code)';
    const action = () => {
        return updateEnabledFileTypeForResource({ [fileType]: !enabled }, uri);
    };
    const item = new MenuItem(`${icon} ${enabled ? 'Disable' : 'Enable'} File Type:`, fileType, action);
    item.detail = `File Type: "${fileType}" is currently ${enabled ? 'enabled' : 'disabled'}.`;
    return item;
}

function itemDocScheme(uri: vscode.Uri | undefined, schemeAllowed: boolean | undefined) {
    if (!uri) return undefined;

    const item = new MenuItem(`$(code) ${schemeAllowed ? 'Exclude' : 'Allow'} Scheme:`, uri.scheme);
    item.detail = `Scheme: "${uri.scheme}" is currently ${schemeAllowed ? 'allowed' : 'excluded'}.`;
    item.action = () => {
        return updateEnabledSchemesResource({ [uri.scheme]: !schemeAllowed }, uri);
    };
    return item;
}

function itemsConfigFiles(configUris?: vscode.Uri[]) {
    if (!configUris?.length)
        return [new CommandMenuItem({ title: '$(new-file) Create Config...', command: knownCommands['cSpell.createCSpellConfig'] })];
    return configUris.map((uri) => {
        const item = new CommandMenuItem(
            { title: 'Open Config File:', command: 'vscode.open', arguments: [uri] },
            vscode.workspace.asRelativePath(uri),
        );
        item.iconPath = vscode.ThemeIcon.File;
        item.detail = uri.fsPath;
        item.resourceUri = uri;
        return item;
    });
}
