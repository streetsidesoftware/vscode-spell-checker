/* eslint-disable no-irregular-whitespace */
export interface SpellCheckerShouldCheckDocSettings {
    /**
     * The maximum line length.
     *
     *
     * Block spell checking if lines are longer than the value given.
     * This is used to prevent spell checking generated files.
     *
     *
     * **Error Message:** _Lines are too long._
     *
     *
     * Hide this message using `#cSpell.enabledNotifications#`
     *
     * @scope language-overridable
     * @default 20000
     */
    blockCheckingWhenLineLengthGreaterThan?: number;

    /**
     * The maximum length of a chunk of text without word breaks.
     *
     *
     * It is used to prevent spell checking of generated files.
     *
     *
     * A chunk is the characters between absolute word breaks.
     * Absolute word breaks match: `/[\s,{}[\]]/`, i.e. spaces or braces.
     *
     *
     * **Error Message:** _Maximum word length exceeded._
     *
     *
     * If you are seeing this message, it means that the file contains a very long line
     * without many word breaks.
     *
     *
     * Hide this message using `#cSpell.enabledNotifications#`
     *
     * @scope language-overridable
     * @default 1000
     */
    blockCheckingWhenTextChunkSizeGreaterThan?: number;

    /**
     * The maximum average length of chunks of text without word breaks.
     *
     *
     * A chunk is the characters between absolute word breaks.
     * Absolute word breaks match: `/[\s,{}[\]]/`
     *
     *
     * **Error Message:** _Average word length is too long._
     *
     *
     * If you are seeing this message, it means that the file contains mostly long lines
     * without many word breaks.
     *
     *
     * Hide this message using `#cSpell.enabledNotifications#`
     *
     * @scope language-overridable
     * @default 200
     */
    blockCheckingWhenAverageChunkSizeGreaterThan?: number;

    /**
     * Spell check VS Code system files.
     * These include:
     * - `vscode-userdata:/**​/settings.json`
     * - `vscode-userdata:/**​/keybindings.json`
     * @scope application
     * @default false
     */
    checkVSCodeSystemFiles?: boolean;
}
