/**
 * This file contains TypeScript interfaces for VS Code extension contributions.
 * VS Code does not currently publish TypeScript interfaces for extension contributions.
 * These interfaces are based on the VS Code codebase.
 *
 * This file is based upon the VS Code codebase, specifically the extensions.ts file:
 * https://github.com/microsoft/vscode/blob/0a1b6b1d9febe5f0ca4943625cc05162411fee97/src/vs/platform/action/common/action.ts
 *
 */

import type { Categories, Icon } from './typesBase.js';

export interface ILocalizedString {
    /**
     * The localized value of the string.
     */
    value: string;

    /**
     * The original (non localized value of the string)
     */
    original: string;
}

export interface ICommandActionTitle extends ILocalizedString {
    /**
     * The title with a mnemonic designation. && precedes the mnemonic.
     */
    mnemonicTitle?: string;
}

export interface ICommandActionSource {
    readonly id: string;
    readonly title: string;
}

export interface ICommandAction {
    id: string;
    title: string | ICommandActionTitle;
    shortTitle?: string | ICommandActionTitle;
    /**
     * Metadata about this command, used for:
     * - API commands
     * - when showing keybindings that have no other UX
     * - when searching for commands in the Command Palette
     */
    // metadata?: ICommandMetadata;
    category?: keyof Categories | ILocalizedString | string;
    tooltip?: string | ILocalizedString;
    icon?: Icon;
    // source?: ICommandActionSource;
    /**
     * Precondition controls enablement (for example for a menu item, show
     * it in grey or for a command, do not allow to invoke it)
     */
    // precondition?: ContextKeyExpression;

    /**
     * The action is a toggle action. Define the context key expression that reflects its toggle-state
     * or define toggle-info including an icon and a title that goes well with a check mark.
     */
    // toggled?: ContextKeyExpression | ICommandActionToggleInfo;
}
