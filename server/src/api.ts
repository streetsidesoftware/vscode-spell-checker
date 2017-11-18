import * as config from './cspellConfig';

export interface GetConfigurationForDocumentResult {
    languageEnabled: boolean | undefined;
    fileEnabled: boolean | undefined;
    settings: config.CSpellUserSettings | undefined;
    docSettings: config.CSpellUserSettings | undefined;
}

export interface IsSpellCheckEnabledResult {
    languageEnabled: boolean | undefined;
    fileEnabled: boolean | undefined;
}

export interface SplitTextIntoWordsResult {
    words: string[];
}

export type RequestMethods = 'isSpellCheckEnabled' | 'getConfigurationForDocument' | 'splitTextIntoWords';
export type RequestMethodConstants = {
    [key in RequestMethods]: RequestMethods;
};

export type NotifyServerMethods = 'onConfigChange' | 'registerConfigurationFile';
export type NotifyServerMethodConstants = {
    [key in NotifyServerMethods]: NotifyServerMethods;
};
