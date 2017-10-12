// Export the cspell settings to the client.

import * as cspell from 'cspell';
export { LanguageSetting } from 'cspell';

export interface SpellCheckerSettings {
    checkLimit?: number;
    diagnosticLevel?: string;
}

export interface CSpellUserSettingsWithComments extends cspell.CSpellUserSettingsWithComments, SpellCheckerSettings {}
export interface CSpellUserSettings extends cspell.CSpellUserSettings, SpellCheckerSettings {}
