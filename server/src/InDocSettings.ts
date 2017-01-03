import { objectToSequence, Sequence } from 'gensequence';
import * as Text from './util/text';
import { CSpellUserSettings } from './CSpellSettingsDef';
import { mergeSettings } from './CSpellSettingsServer';
import { createSpellingDictionary, SpellingDictionary } from './SpellingDictionary';

const regExMatchRegEx = /\/.*\/[gimuy]*/;
const regExInFileSetting = /(?:spell-?checker|cSpell)::?([^\s]+)(.*)/gi;
const regExIgnoreRegExpPattern = /(?:spell-?checker|cSpell)::?ignore_?Reg_?Exp\s+(.+)/gi;
const regExIgnoreWords = /(?:spell-?checker|cSpell)::?(?:ignore_?(?:\s?Words?)?|words?)\s+(.+)/gi;

export type CSpellUserSettingsKeys = keyof CSpellUserSettings;
export interface InDocSetting<P extends CSpellUserSettingsKeys> {
    setting: P;
    value: CSpellUserSettings[P];
}

export interface InDocSettings {
    enableCompoundWords: InDocSetting<'allowCompoundWords'>;
    disableCompoundWords: InDocSetting<'allowCompoundWords'>;
}

export const inDocSettings: InDocSettings = {
    enableCompoundWords: { setting: 'allowCompoundWords', value: true },
    disableCompoundWords: { setting: 'allowCompoundWords', value: false },
};

export function getInDocumentSettings(text: string): CSpellUserSettings {
    const settingMap = new Map(objectToSequence(inDocSettings));
    const keysNormalized = objectToSequence(inDocSettings)
        .map(([k]) => ([k.toString().toLowerCase(), k]) as [string, keyof InDocSettings]);
    const settingKeyLookup = new Map(keysNormalized);

    const settings = Text.match(regExInFileSetting, text)
        .map(a => a[1] || '')
        // Normalize the setting
        .map(a => a.toLowerCase())
        // Look it up in the map
        .map(a => settingKeyLookup.get(a))
        .filter(k => !!k)
        .map((k) => settingMap.get(k!))
        .map(setting => ({[setting!.setting]: setting!.value}))
        .reduce((s, setting) => {
            return mergeSettings(s, setting);
        }, {} as CSpellUserSettings);
    return mergeSettings(settings, {
        ignoreRegExpList: getIgnoreRegExpFromDocument(text).toArray(),
    });
}

export function getIgnoreWordsDictionaryFromDoc(text: string): SpellingDictionary {
    return createSpellingDictionary(getIgnoreWordsFromDocument(text));
}

export function getIgnoreWordsFromDocument(text: string): Sequence<string> {
    const matches = Text.match(regExIgnoreWords, text)
        .map(a => a[1])
        .concatMap(words => words.split(/[,\s]+/g));
    return matches;
}

export function getIgnoreWordsSetFromDocument(text: string) {
    return new Set(getIgnoreWordsFromDocument(text).map(a => a.toLowerCase()));
}

export function getIgnoreRegExpFromDocument(text: string): Sequence<string> {
    const matches = Text.match(regExIgnoreRegExpPattern, text)
        .map(a => a[1])
        .map(a => {
            const m = a.match(regExMatchRegEx);
            if (m && m[0]) {
                return m[0];
            }
            return a.split(/\s+/g).filter(a => !!a)[0];
        });
    return matches;
}
