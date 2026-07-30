import type { Req, Res, ServerMethods, ServerRequestApi } from '@internal/server-pattern-matcher/api';
import type { CodeAction, CodeActionParams, Command, LanguageClient } from 'vscode-languageclient/node';
import { CodeActionRequest, RequestType } from 'vscode-languageclient/node';

export type {
    MatchPatternsToDocumentResult,
    NamedPattern,
    PatternMatch,
    PatternSettings,
    ServerMethods,
} from '@internal/server-pattern-matcher/api';

export type PatternMatcherServerApi = ServerRequestApi;

type RequestCodeActionResult = (Command | CodeAction)[] | null;

export async function requestCodeAction(client: LanguageClient, params: CodeActionParams): Promise<RequestCodeActionResult> {
    const request = CodeActionRequest.type;
    const result = await client.sendRequest(request, params);
    return result;
}

export function createServerApi(client: LanguageClient): PatternMatcherServerApi {
    async function sendRequest<M extends keyof ServerMethods>(method: M, param: Req<ServerMethods[M]>): Promise<Res<ServerMethods[M]>> {
        const r: RequestType<Req<ServerMethods[M]>, Res<ServerMethods[M]>, void> = new RequestType(method);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (await client.sendRequest(r, param as any)) as Res<ServerMethods[M]>;
        return result;
    }

    const api: PatternMatcherServerApi = {
        matchPatternsInDocument: (param) => sendRequest('matchPatternsInDocument', param),
    };

    return api;
}
