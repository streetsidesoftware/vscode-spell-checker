// Export the cspell settings to the client.

import * as cspell from 'cspell';
export { LanguageSetting, DictionaryDefinition } from 'cspell';

export interface SpellCheckerSettings {
    checkLimit?: number;
    diagnosticLevel?: string;
    // By default the allowed schemas are ['file', 'untitled']
    allowedSchemas?: string[];
    logLevel?: "None" | "Error" | "Warning" | "Information" | "Debug";
    // Show the spell checker status on the status bar.
    showStatus?: boolean;
    // Delay between changes before running the spell checker.
    spellCheckDelayMs?: number;
    showCommandsInEditorContextMenu?: boolean;
}

export interface CSpellUserSettingsWithComments extends cspell.CSpellUserSettingsWithComments, SpellCheckerSettings {}
export interface CSpellUserSettings extends cspell.CSpellSettings, SpellCheckerSettings {}
