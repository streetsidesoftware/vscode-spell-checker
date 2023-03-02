import type { ConfigScopeVScode, ConfigTarget } from './config/configTargets';
import type * as config from './config/cspellConfig';

export type {
    ConfigKind,
    ConfigScope,
    ConfigTarget,
    ConfigTargetCSpell,
    ConfigTargetDictionary,
    ConfigTargetVSCode,
} from './config/configTargets';
export type {
    CSpellUserSettings,
    CustomDictionaries,
    CustomDictionary,
    CustomDictionaryEntry,
    CustomDictionaryScope,
    CustomDictionaryWithScope,
    DictionaryDefinition,
    DictionaryDefinitionCustom,
    DictionaryFileTypes,
    LanguageSetting,
    SpellCheckerSettings,
    SpellCheckerSettingsProperties,
} from './config/cspellConfig';

export type ExtensionId = 'cSpell';

export type DiagnosticSource = ExtensionId;

export type VSCodeSettingsCspell = {
    [key in ExtensionId]?: config.CSpellUserSettings;
};

/**
 * Method signatures for requests to the Server.
 */
export type ServerRequestApi = {
    [key in keyof ServerMethods]: ApiReqResFn<ServerMethods[key]>;
};

/**
 * Internal Server Handler signatures to the Server API
 */
export type ServerRequestApiHandlers = ApiHandlers<ServerMethods>;

/**
 * Server RPC Request and Result types
 */
export type ServerMethods = {
    getConfigurationForDocument: ReqRes<GetConfigurationForDocumentRequest, GetConfigurationForDocumentResult>;
    isSpellCheckEnabled: ReqRes<TextDocumentInfo, IsSpellCheckEnabledResult>;
    splitTextIntoWords: ReqRes<string, SplitTextIntoWordsResult>;
    spellingSuggestions: ReqRes<TextDocumentInfo, SpellingSuggestionsResult>;
};

/**
 * One way RPC calls to the server
 */
export type ServerNotifyApi = {
    notifyConfigChange: () => void;
    registerConfigurationFile: (path: string) => void;
};

/**
 * Notification that can be sent to the client
 */
export type ClientNotifications = {
    onSpellCheckDocument: OnSpellCheckDocumentStep;
};

/**
 * Client side API for listening to notifications from the server
 */
export type ClientNotificationsApi = {
    [method in keyof ClientNotifications]: (p: ClientNotifications[method]) => void;
};

/**
 * Internal - API for sending notifications to the client
 */
export type SendClientNotificationsApi = {
    [method in keyof ClientNotifications as `send${Capitalize<method>}`]: (p: ClientNotifications[method]) => void;
};

/**
 * Requests that can be made of the client
 */
export type RequestsToClient = {
    onWorkspaceConfigForDocumentRequest: ReqRes<WorkspaceConfigForDocumentRequest, WorkspaceConfigForDocumentResponse>;
};

/**
 * Internal - API for sending requests to the client
 */
export type SendRequestsToClientApi = {
    [method in keyof RequestsToClient as `send${Capitalize<method>}`]: ApiReqResFn<RequestsToClient[method]>;
};

export type ClientSideCommandHandlerApi = {
    [command in keyof CommandsToClient as `cSpell.${command}`]: (...params: Parameters<CommandsToClient[command]>) => OrPromise<void>;
};
export interface CommandsToClient {
    addWordsToVSCodeSettingsFromServer: (words: string[], documentUri: string, target: ConfigurationTarget) => void;
    addWordsToDictionaryFileFromServer: (words: string[], documentUri: string, dict: { uri: string; name: string }) => void;
    addWordsToConfigFileFromServer: (words: string[], documentUri: string, config: { uri: string; name: string }) => void;
}

export type RequestsToClientApiHandlers = ApiHandlers<RequestsToClient>;

export interface GetConfigurationForDocumentRequest extends TextDocumentInfo {
    /** used to calculate configTargets, configTargets will be empty if undefined. */
    workspaceConfig?: WorkspaceConfigForDocument;
}

export interface GetConfigurationForDocumentResult extends IsSpellCheckEnabledResult {
    settings: config.CSpellUserSettings | undefined;
    docSettings: config.CSpellUserSettings | undefined;
    configFiles: UriString[];
    configTargets: ConfigTarget[];
}

export interface ExcludeRef {
    glob: string;
    id: string | undefined;
    name: string | undefined;
    configUri: string | undefined;
}

export interface GitignoreInfo {
    gitIgnoreFile: string;
    glob: string | undefined;
    line: number | undefined;
    matched: boolean;
    root: string | undefined;
}

export interface IsSpellCheckEnabledResult {
    languageEnabled: boolean | undefined;
    fileEnabled: boolean;
    fileIsIncluded: boolean;
    fileIsExcluded: boolean;
    excludedBy: ExcludeRef[] | undefined;
    gitignored: boolean | undefined;
    gitignoreInfo: GitignoreInfo | undefined;
    blockedReason: BlockedFileReason | undefined;
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

export type ServerRequestMethods = keyof ServerMethods;

export type ServerRequestMethodConstants = {
    [key in ServerRequestMethods]: key;
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

export interface WorkspaceConfigForDocumentRequest {
    uri: DocumentUri;
}

export interface WorkspaceConfigForDocument {
    uri: DocumentUri | undefined;
    workspaceFile: UriString | undefined;
    workspaceFolder: UriString | undefined;
    words: FieldExistsInTarget;
    ignoreWords: FieldExistsInTarget;
}

export interface WorkspaceConfigForDocumentResponse extends WorkspaceConfigForDocument {}

export type FieldExistsInTarget = {
    [key in ConfigurationTarget]?: boolean;
};

export type ConfigurationTarget = ConfigScopeVScode;

export type UriString = string;
export type DocumentUri = UriString;

export type Req<T> = T extends { request: infer R } ? R : never;
export type Res<T> = T extends { response: infer R } ? R : never;
export type Fn<T> = T extends { fn: infer R } ? R : never;
export type OrPromise<T> = Promise<T> | T;

export type ReqRes<Req, Res> = {
    request: Req;
    response: Res;
};

/**
 * Utility type to combine the Request and Response to create the Handler function
 */
export type RequestResponseFn<ReqRes> = {
    request: Req<ReqRes>;
    response: Res<ReqRes>;
    fn: ApiReqHandler<ReqRes>;
};

export type ApiReqResFn<ReqRes> = ApiFn<Req<ReqRes>, Res<ReqRes>>;
export type ApiFn<Req, Res> = (req: Req) => Promise<Res>;

export type ApiReqHandler<ReqRes> = ApiHandler<Req<ReqRes>, Res<ReqRes>>;
export type ApiHandler<Req, Res> = (req: Req) => OrPromise<Res>;

export type ApiHandlers<ApiReqRes> = {
    [M in keyof ApiReqRes]: ApiReqHandler<ApiReqRes[M]>;
};

export type ApiReqResMethods<ApiReqRes> = {
    [M in keyof ApiReqRes]: ApiReqResFn<ApiReqRes[M]>;
};

export interface BlockedFileReason {
    code: string;
    message: string;
    documentationRefUri?: UriString;
}
