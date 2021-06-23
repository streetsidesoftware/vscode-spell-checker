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

export type ServerRequestApi = {
    [key in keyof _ServerRequestApi]: (...params: Parameters<_ServerRequestApi[key]>) => Promise<ReturnType<_ServerRequestApi[key]>>;
};

/**
 * Server RPC Request and Result types
 */
export type _ServerRequestApi = {
    getConfigurationForDocument: ServerRPCDef<TextDocumentInfo, GetConfigurationForDocumentResult>;
    isSpellCheckEnabled: ServerRPCDef<TextDocumentInfo, IsSpellCheckEnabledResult>;
    splitTextIntoWords: ServerRPCDef<string, SplitTextIntoWordsResult>;
    spellingSuggestions: ServerRPCDef<TextDocumentInfo, SpellingSuggestionsResult>;
    matchPatternsInDocument: ServerRPCDef<MatchPatternsToDocumentRequest, MatchPatternsToDocumentResult>;
};

/**
 * One way RPC calls to the server
 */
export type ServerNotifyApi = {
    notifyConfigChange: () => void;
    registerConfigurationFile: (path: string) => void;
};

export type ClientNotifications = {
    onSpellCheckDocument: OnSpellCheckDocumentStep;
};

export type ClientNotificationsApi = {
    [method in keyof ClientNotifications]: (p: ClientNotifications[method]) => void;
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

export type ServerRequestMethods = keyof ServerRequestApi;

export type ServerRequestMethodConstants = {
    [key in ServerRequestMethods]: key;
};

type ServerRPCDef<Req, Res> = (req: Req) => Res;

export type NotifyServerMethods = keyof ServerNotifyApi;
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

export interface OnSpellCheckDocumentStep extends NotificationInfo {
    /**
     * uri of the text document
     */
    uri: DocumentUri;

    /**
     *
     */
    version: number;

    /**
     * name of step.
     */
    step: string;

    /**
     * Number of issues found
     */
    numIssues?: number;

    /**
     * true if it is finished
     */
    done?: boolean;
}

export interface NotificationInfo {
    /**
     * Sequence number.
     * Notifications can be sorted based upon the sequence number to give the order
     * in which the Notification was generated.
     * It should be unique between Notifications of the same type.
     */
    seq: number;

    /**
     * timestamp in ms.
     */
    ts: number;
}

export type UriString = string;
export type DocumentUri = UriString;
