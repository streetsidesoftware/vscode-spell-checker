import { Sequence } from 'gensequence';
import * as Text from './util/text';
import { CSpellUserSettings } from './CSpellSettingsDef';
import { mergeSettings } from './CSpellSettingsServer';
import { createSpellingDictionary, SpellingDictionary } from './SpellingDictionary';

const regExMatchRegEx = /\/.*\/[gimuy]*/;
const regExInFileSetting = /(?:spell-?checker|cSpell)::?\s*(.*)/gi;

export type CSpellUserSettingsKeys = keyof CSpellUserSettings;

export function getInDocumentSettings(text: string): CSpellUserSettings {
    const settings = getPossibleInDocSettings(text)
        .map(a => a[1] || '')
        .concatMap(a => parseSettingMatch(a))
        .reduce((s, setting) => {
            return mergeSettings(s, setting);
        }, {} as CSpellUserSettings);
    return settings;
}

function parseSettingMatch(possibleSetting: string): CSpellUserSettings[] {
    const settingParsers: [RegExp, (m: string) => CSpellUserSettings][] = [
        [ /^(?:allow|enable|disable)?CompoundWords/i, parseCompoundWords ],
        [ /^words?\s/i , parseWords ],
        [ /^ignore(?:words?)?\s/i, parseIgnoreWords ],
        [ /^ignore_?Reg_?Exp\s+.+$/i, parseIgnoreRegExp ],
    ];

    return settingParsers
        .filter(([regex]) => regex.test(possibleSetting))
        .map(([, fn]) => fn)
        .map(fn => fn(possibleSetting));
}

function parseCompoundWords(match: string): CSpellUserSettings {
    const allowCompoundWords = (/enable/i).test(match);
    return { allowCompoundWords };
}

function parseWords(match: string): CSpellUserSettings {
    const words = match.split(/[,\s]+/g).slice(1);
    return { words };
}

function parseIgnoreWords(match: string): CSpellUserSettings {
    const wordsSetting = parseWords(match);
    return { ignoreWords: wordsSetting.words };
}

function parseIgnoreRegExp(match: string): CSpellUserSettings {
    const ignoreRegExpList = [ match.replace(/^[^\s]+\s+/, '') ]
        .map(a => {
            const m = a.match(regExMatchRegEx);
            if (m && m[0]) {
                return m[0];
            }
            return a.split(/\s+/g).filter(a => !!a)[0];
        });
    return { ignoreRegExpList };
}


function getPossibleInDocSettings(text): Sequence<RegExpExecArray> {
    return Text.match(regExInFileSetting, text);
}

export function getWordsDictionaryFromDoc(text: string): SpellingDictionary {
    return createSpellingDictionary(getWordsFromDocument(text));
}

function getWordsFromDocument(text: string): string[] {
    const { words = [] } = getInDocumentSettings(text);
    return words;
}

export function getIgnoreWordsFromDocument(text: string): string[] {
    const { ignoreWords = [] } = getInDocumentSettings(text);
    return ignoreWords;
}

export function getIgnoreWordsSetFromDocument(text: string) {
    return new Set(getIgnoreWordsFromDocument(text).map(a => a.toLowerCase()));
}

export function getIgnoreRegExpFromDocument(text: string): (string|RegExp)[] {
    const { ignoreRegExpList = [] } = getInDocumentSettings(text);
    return ignoreRegExpList;
}


/**
 * These internal functions are used exposed for unit testing.
 */
export const internal = {
    getPossibleInDocSettings,
    getWordsFromDocument,
    parseWords,
    parseCompoundWords,
    parseIgnoreRegExp,
    parseIgnoreWords,
};
