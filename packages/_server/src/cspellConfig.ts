// Export the cspell settings to the client.

import * as cspell from 'cspell';
export { LanguageSetting, DictionaryDefinition } from 'cspell';

export interface SpellCheckerSettings {
    checkLimit?: number;
    diagnosticLevel?: string;
    // By default the allowed schemas is ['file', 'untitled']
    allowedSchemas?: string[];
}

export interface CSpellUserSettingsWithComments extends cspell.CSpellUserSettingsWithComments, SpellCheckerSettings {}
export interface CSpellUserSettings extends cspell.CSpellSettings, SpellCheckerSettings {}
