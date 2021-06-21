import type * as config from './config/cspellConfig';

export type {
    LanguageSetting,
    DictionaryDefinition,
    DictionaryFileTypes,
    CustomDictionaryScope,
    DictionaryDefinitionCustom,
    SpellCheckerSettings,
    CustomDictionaryEntry,
    CustomDictionaryWithScope,
    CSpellUserSettingsWithComments,
    CSpellUserSettings,
    SpellCheckerSettingsProperties,
} from './config/cspellConfig';

/**
 * Server RPC Api.
 */
export type ServerRequestApi = {
    [key in keyof ServerMethodRequestResult]: (
        param: ServerMethodRequestResult[key]['request']
    ) => Promise<ServerMethodRequestResult[key]['result']>;
};

/**
 * Server RPC Request and Result types
 */
export type ServerMethodRequestResult = {
    getConfigurationForDocument: ServerRequestResult<TextDocumentInfo, GetConfigurationForDocumentResult>;
    isSpellCheckEnabled: ServerRequestResult<TextDocumentInfo, IsSpellCheckEnabledResult>;
    splitTextIntoWords: ServerRequestResult<string, SplitTextIntoWordsResult>;
    spellingSuggestions: ServerRequestResult<TextDocumentInfo, SpellingSuggestionsResult>;
    matchPatternsInDocument: ServerRequestResult<MatchPatternsToDocumentRequest, MatchPatternsToDocumentResult>;
};

/**
 * One way RPC calls to the server
 */
export type ServerNotifyApi = {
    [key in keyof NotifyServerMethodParams]: (...params: NotifyServerMethodParams[key]) => void;
};

/**
 * Notify the server params
 */
export type NotifyServerMethodParams = {
    onConfigChange: [];
    registerConfigurationFile: [path: string];
};

export interface GetConfigurationForDocumentResult {
    languageEnabled: boolean | undefined;
    fileEnabled: boolean | undefined;
    settings: config.CSpellUserSettings | undefined;
    docSettings: config.CSpellUserSettings | undefined;
    excludedBy: ExcludeRef[] | undefined;
    configFiles: UriString[];
}

export interface ExcludeRef {
    glob: string;
    id: string | undefined;
    name: string | undefined;
    filename: string | undefined;
}

export interface IsSpellCheckEnabledResult {
    languageEnabled: boolean | undefined;
    fileEnabled: boolean | undefined;
    excludedBy: ExcludeRef[] | undefined;
}

export interface SplitTextIntoWordsResult {
    words: string[];
}

export interface SpellingSuggestionsResult {}

export interface TextDocumentInfo {
    uri?: UriString;
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
};

export type ServerRequestMethodResults = {
    [key in keyof ServerMethodRequestResult]: ServerMethodRequestResult[key]['result'];
};

export type ServerRequestMethodRequests = {
    [key in keyof ServerMethodRequestResult]: ServerMethodRequestResult[key]['request'];
};

export type NotifyServerMethods = keyof NotifyServerMethodParams;
export type NotifyServerMethodConstants = {
    [key in NotifyServerMethods]: NotifyServerMethods;
};

export interface TextDocumentRef {
    uri: UriString;
}

export interface NamedPattern {
    name: string;
    pattern: string | string[];
}

export interface MatchPatternsToDocumentRequest extends TextDocumentRef {
    patterns: (string | NamedPattern)[];
}

export type StartIndex = number;
export type EndIndex = number;

export type RangeTuple = [StartIndex, EndIndex];

export interface RegExpMatch {
    regexp: string;
    matches: RangeTuple[];
    elapsedTime: number;
    errorMessage?: string;
}

export type RegExpMatchResults = RegExpMatch;

export interface PatternMatch {
    name: string;
    defs: RegExpMatch[];
}

export interface MatchPatternsToDocumentResult {
    uri: UriString;
    version: number;
    patternMatches: PatternMatch[];
    message?: string;
}

export type UriString = string;
