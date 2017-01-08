import { TextDocument } from 'vscode-languageserver';
import { calcUserSettingsForLanguage } from './LanguageSettings';
import { CSpellUserSettings } from './CSpellSettingsDef';
import * as CSpellSettings from './CSpellSettingsServer';
import { getInDocumentSettings } from './InDocSettings';
import { createCollectionP } from './SpellingDictionaryCollection';
import { createSpellingDictionary, SpellingDictionary } from './SpellingDictionary';
import { loadDictionaries } from './Dictionaries';

export function getSettingsForDocument(settings: CSpellUserSettings, document: TextDocument) {
    return getSettings(settings, document.getText(), document.languageId);
}

export function getSettings(settings: CSpellUserSettings, text: string, languageId: string) {
    const langSettings = calcUserSettingsForLanguage(settings, languageId);
    return CSpellSettings.finalizeSettings(
        CSpellSettings.mergeSettings(langSettings, getInDocumentSettings(text))
    );
}

export function getDictionary(settings: CSpellUserSettings): Promise<SpellingDictionary> {
    const { words = [], dictionaries = [], dictionaryDefinitions = [] } = settings;
    const spellDictionaries = loadDictionaries(dictionaries, dictionaryDefinitions);
    const settingsDictionary = Promise.resolve(createSpellingDictionary(words));
    return createCollectionP([...spellDictionaries, settingsDictionary]);
}
