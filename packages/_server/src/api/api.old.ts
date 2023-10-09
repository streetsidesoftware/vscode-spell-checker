import type {
    ConfigurationTarget,
    OnSpellCheckDocumentStep,
    WorkspaceConfigForDocumentRequest,
    WorkspaceConfigForDocumentResponse,
} from './apiModels.js';

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
export interface ServerMethods {}

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

export type ServerRequestMethods = keyof ServerMethods;

export type ServerRequestMethodConstants = {
    [key in ServerRequestMethods]: key;
};

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
