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

export interface SpellingSuggestionsResult {

}

export interface TextDocumentInfo {
    uri?: string;
    languageId?: string;
    text?: string;
}

export type ServerRequestMethods = keyof ServerMethodRequestResult;

export type ServerRequestMethodConstants = {
    [key in ServerRequestMethods]: key;
};

type ServerRequestResult<Req, Res> = {
    request: Req;
    result: Res;
}

export type ServerMethodRequestResult = {
    getConfigurationForDocument: ServerRequestResult<TextDocumentInfo, GetConfigurationForDocumentResult>;
    isSpellCheckEnabled: ServerRequestResult<TextDocumentInfo, IsSpellCheckEnabledResult>;
    splitTextIntoWords: ServerRequestResult<string, SplitTextIntoWordsResult>;
    spellingSuggestions: ServerRequestResult<TextDocumentInfo, SpellingSuggestionsResult>;
};

export type ServerRequestMethodResults = {
    [key in keyof ServerMethodRequestResult]: ServerMethodRequestResult[key]['result'];
};

export type ServerRequestMethodRequests = {
    [key in keyof ServerMethodRequestResult]: ServerMethodRequestResult[key]['request'];
};

export type NotifyServerMethods = 'onConfigChange' | 'registerConfigurationFile';
export type NotifyServerMethodConstants = {
    [key in NotifyServerMethods]: NotifyServerMethods;
};
