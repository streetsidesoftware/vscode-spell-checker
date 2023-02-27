import { Connection, NotificationType, RequestType } from 'vscode-languageserver';

import {
    ClientNotifications,
    OnSpellCheckDocumentStep,
    Req,
    RequestsToClient,
    Res,
    SendClientNotificationsApi,
    SendRequestsToClientApi,
    WorkspaceConfigForDocumentRequest,
} from './api';

export interface ClientApi extends SendClientNotificationsApi, SendRequestsToClientApi {}

export function createClientApi(connection: Connection): ClientApi {
    function sendNotification<M extends keyof ClientNotifications>(method: M, param: ClientNotifications[M]) {
        const n = new NotificationType<ClientNotifications[M]>(method);
        connection.sendNotification(n, param);
    }

    function sendRequest<M extends keyof RequestsToClient>(method: M, param: Req<RequestsToClient[M]>) {
        const req = new RequestType<Req<RequestsToClient[M]>, Res<RequestsToClient[M]>, undefined>(method);
        return connection.sendRequest(req, param);
    }

    return {
        sendOnSpellCheckDocument: (param: OnSpellCheckDocumentStep) => sendNotification('onSpellCheckDocument', param),
        sendOnWorkspaceConfigForDocumentRequest: (param: WorkspaceConfigForDocumentRequest) =>
            sendRequest('onWorkspaceConfigForDocumentRequest', param),
    };
}
