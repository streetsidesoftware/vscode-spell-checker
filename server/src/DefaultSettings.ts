import { CSpellUserSettings } from './CSpellSettingsDef'
import { mergeSettings } from './CSpellSettingsServer';
import * as RxPat from './RegExpPatterns';
import * as Dictionaries from './Dictionaries';
import * as LanguageSettings from './LanguageSettings';


const settings: CSpellUserSettings = {
    enabledLanguageIds: [
        'csharp', 'go', 'javascript', 'javascriptreact', 'markdown',
        'php', 'plaintext', 'python', 'text', 'typescript', 'typescriptreact'
    ],
    maxNumberOfProblems: 100,
    numSuggestions: 10,
    spellCheckDelayMs: 50,
    words: [],
    userWords: [],
    ignorePaths: [],
    allowCompoundWords: false,
};


export function getDefaultSettings(): CSpellUserSettings {
    return mergeSettings(
        settings,
        RxPat.defaultSettings,
        Dictionaries.defaultSettings,
        LanguageSettings.getDefaultLanguageSettings(),
    );
}