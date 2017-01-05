import { TextDocument } from 'vscode-languageserver';
import * as SpellChecker from './spellChecker';
import { calcUserSettingsForLanguage } from './LanguageSettings';
import { CSpellUserSettings } from './CSpellSettingsDef';
import * as CSpellSettings from './CSpellSettingsServer';
import { getInDocumentSettings } from './InDocSettings';
import { createCollection } from './SpellingDictionaryCollection';
import { createSpellingDictionary, SpellingDictionary } from './SpellingDictionary';

export function getSettingsForDocument(settings: CSpellUserSettings, document: TextDocument) {
    return getSettings(settings, document.getText(), document.languageId);
}

export function getSettings(settings: CSpellUserSettings, text: string, languageId: string) {
    const langSettings = calcUserSettingsForLanguage(settings, languageId);
    return CSpellSettings.finalizeSettings(
        CSpellSettings.mergeSettings(langSettings, getInDocumentSettings(text))
    );
}

export function getDictionary(settings: CSpellUserSettings): SpellingDictionary {
    const activeDictionary = SpellChecker.getActiveDictionary();
    const { words = [] } = settings;
    const settingsDictionary = createSpellingDictionary([...words]);
    return createCollection([activeDictionary, settingsDictionary]);
}
