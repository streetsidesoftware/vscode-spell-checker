import type { CSpellUserSettings } from '@cspell/cspell-types';
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
    matchPatternsInDocument: ReqRes<MatchPatternsToDocumentRequest, MatchPatternsToDocumentResult>;
};

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

export type PatternSettings = {
    patterns: CSpellUserSettings['patterns'];
};

export interface MatchPatternsToDocumentRequest extends TextDocumentRef {
    patterns: (string | NamedPattern)[];
    settings: PatternSettings;
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
