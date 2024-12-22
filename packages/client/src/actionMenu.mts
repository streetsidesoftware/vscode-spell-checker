import { isDefined } from '@internal/common-utils';
import { ConfigFields } from 'code-spell-checker-server/lib';
import { createDisposableList } from 'utils-disposables';
import type { Disposable, QuickPickItem } from 'vscode';
import vscode from 'vscode';

import { knownCommands } from './commands.mjs';
import { extensionId } from './constants.js';
import { getClient } from './di.mjs';
import { updateEnabledFileTypeForResource, updateEnabledSchemesResource } from './settings/settings.mjs';
import { handleErrors } from './util/errors.js';

const debug = false;
const consoleLog = debug ? console.log : () => undefined;

export interface ActionsMenuOptions {
    areIssuesVisible: () => boolean;
}

export function registerActionsMenu(options: ActionsMenuOptions): Disposable {
    const dList = createDisposableList();
    dList.push(vscode.commands.registerCommand('cspell.showActionsMenu', () => actionMenu(options)));
    return dList;
}

type Action = () => Promise<void>;

interface ActionMenuItem extends QuickPickItem {
    resourceUri?: vscode.Uri;
    action?: Action | undefined;
}

async function actionMenu(options: ActionsMenuOptions) {
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
        // itemDictionaries(),
        itemCommand({ title: '$(file) Show File Info...', command: knownCommands['cSpell.openFileInfoView'] }),
        itemCommand({
            title: '$(console) Open Spell Checker REPL Console.',
            command: knownCommands['cSpell.createCSpellTerminal'],
        }),
        itemCommand({ title: '$(issues) Open Spelling Issues Panel.', command: 'cSpell.openIssuesPanel' }),
        itemSeparator(),
        itemCommand({
            title: '$(keyboard) Edit Keyboard Shortcuts...',
            command: 'workbench.action.openGlobalKeybindings',
            arguments: ['Spell:'],
        }),
        itemCommand({ title: '$(gear) Edit Settings...', command: 'workbench.action.openSettings', arguments: [extensionId] }),
    ].filter(isDefined);

    return quickPickMenu({ items, title: 'Spell Checker Actions Menu' }).catch(() => undefined);
}

type QuickPick = vscode.QuickPick<QuickPickItem>;

interface QuickPickMenuOptions extends Partial<Pick<QuickPick, 'matchOnDescription' | 'matchOnDetail'>> {
    title: string;
    items: QuickPickItem[];
    selected?: QuickPickItem | undefined;
    enableBackButton?: boolean;
}

async function quickPickMenu(options: QuickPickMenuOptions): Promise<void> {
    options = { ...options };
    let active = true;
    while (active) {
        try {
            active = false;
            const result = await openMenu(options);
            if (result instanceof MenuItem) {
                options.selected = result;
                await result.action();
                continue;
            }
            if (typeof result === 'function') {
                await result();
                continue;
            }
            return;
        } catch (e) {
            if (e === NavigationStep.back) {
                consoleLog('Going back', options.title);
                throw NavigationStep.redraw;
            }
            if (e === NavigationStep.cancel) {
                consoleLog('Cancel', options.title);
                return;
            }
            if (e === NavigationStep.redraw) {
                consoleLog('Redraw', options.title);
                active = true;
                continue;
            }
            throw e;
        }
    }
}

async function openMenu(options: QuickPickMenuOptions): Promise<QuickPickItem | Action> {
    const instanceId = performance.now();
    const dList = createDisposableList();
    try {
        return await new Promise<QuickPickItem | Action>((resolve, reject) => {
            const quickPick = vscode.window.createQuickPick<QuickPickItem>();
            dList.push(quickPick);
            quickPick.title = options.title;
            quickPick.items = options.items;
            if (options.enableBackButton) {
                quickPick.buttons = [vscode.QuickInputButtons.Back];
            }
            if (options.selected) {
                quickPick.activeItems = [options.selected];
            }
            if (options.matchOnDescription !== undefined) quickPick.matchOnDescription = options.matchOnDescription;
            if (options.matchOnDetail !== undefined) quickPick.matchOnDetail = options.matchOnDetail;
            dList.push(
                quickPick.onDidChangeSelection((selection) => {
                    consoleLog('onDidChangeSelection', selection);
                }),
                quickPick.onDidChangeActive((active) => {
                    consoleLog('onDidChangeActive', active);
                }),
                quickPick.onDidTriggerButton((button) => {
                    consoleLog('onDidTriggerButton', button);
                    if (button === vscode.QuickInputButtons.Back) {
                        reject(NavigationStep.back);
                    }
                }),
                quickPick.onDidTriggerItemButton((e) => {
                    consoleLog('onDidTriggerItemButton', e);
                    const button = e.button;
                    if (button instanceof ActionButtonItem && button.action) {
                        resolve(button.action);
                    }
                }),
                quickPick.onDidAccept(() => {
                    consoleLog('onDidAccept', quickPick.selectedItems);
                    const item = quickPick.selectedItems[0];
                    resolve(item);
                }),
                quickPick.onDidHide(() => {
                    consoleLog(`onDidHide: ${options.title} - ${instanceId}`);
                    reject(NavigationStep.cancel);
                }),
            );
            consoleLog(`Showing menu: ${options.title} - ${instanceId}`);
            quickPick.show();
        });
    } finally {
        consoleLog(`Disposing of menu: ${options.title} - ${instanceId}`);
        dList.dispose();
    }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class NavigationStep {
    static back = new NavigationStep();
    static cancel = new NavigationStep();
    static redraw = new NavigationStep();
}

class ActionButtonItem implements vscode.QuickInputButton {
    constructor(
        public iconPath: vscode.ThemeIcon,
        public tooltip?: string | undefined,
        public action?: Action | undefined,
    ) {}
}

class CommandButtonItem extends ActionButtonItem {
    constructor(
        public iconPath: vscode.ThemeIcon,
        public command: vscode.Command,
    ) {
        super(new vscode.ThemeIcon('gear'), command.tooltip ?? command.title, commandFn(command));
    }
}

class MenuItem implements ActionMenuItem {
    #action: Action;
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
        action?: Action | undefined,
    ) {
        this.#action = action || (() => Promise.resolve(undefined));
    }

    get action() {
        return this.#action;
    }

    set action(fn: Action) {
        this.#action = fn;
    }
}

class CommandMenuItem extends MenuItem {
    constructor(
        readonly command: vscode.Command,
        public description?: string,
    ) {
        super(command.title, description, commandFn(command));
    }
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

function itemDocFileType(uri: vscode.Uri | undefined, fileType: string | undefined, enabled: boolean | undefined) {
    if (!fileType || enabled === undefined) return undefined;
    const icon = enabled ? '$(code)' : '$(code)';
    const action = () => {
        return updateEnabledFileTypeForResource({ [fileType]: !enabled }, uri);
    };
    const item = new MenuItem(`${icon} ${enabled ? 'Disable' : 'Enable'} File Type:`, fileType, action);
    item.detail = `File Type: "${fileType}" is currently ${enabled ? 'enabled' : 'disabled'}.`;
    item.buttons = [
        new CommandButtonItem(new vscode.ThemeIcon('gear'), {
            title: 'Edit Enable File Type in Settings',
            command: 'workbench.action.openSettings',
            arguments: [ConfigFields.enabledFileTypes],
        }),
    ];
    return item;
}

function itemDocScheme(uri: vscode.Uri | undefined, schemeAllowed: boolean | undefined) {
    if (!uri) return undefined;

    const item = new MenuItem(`$(code) ${schemeAllowed ? 'Exclude' : 'Allow'} Scheme:`, uri.scheme);
    item.detail = `Scheme: "${uri.scheme}" is currently ${schemeAllowed ? 'allowed' : 'excluded'}.`;
    item.action = () => {
        return updateEnabledSchemesResource({ [uri.scheme]: !schemeAllowed }, uri);
    };
    item.buttons = [
        new CommandButtonItem(new vscode.ThemeIcon('gear'), {
            title: 'Edit Enable Scheme in Settings',
            command: 'workbench.action.openSettings',
            arguments: [ConfigFields.enabledSchemes],
        }),
    ];
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
        item.detail = vscode.workspace.asRelativePath(uri, true);
        item.resourceUri = uri;
        return item;
    });
}

// function itemDictionaries() {
//     const item = new MenuItem('$(book) Dictionaries...', undefined, () => {
//         const items: QuickPickItem[] = [
//             { label: 'Add Dictionary', description: 'Add a new dictionary.', alwaysShow: true },
//             itemSeparator(),
//         ];
//         return quickPickMenu({ items, enableBackButton: true, title: 'Dictionaries' });
//     });
//     return item;
// }

async function runCommand(command: vscode.Command) {
    await vscode.commands.executeCommand(command.command, ...(command.arguments || []));
}

function commandFn(command: vscode.Command) {
    return () => runCommand(command);
}
