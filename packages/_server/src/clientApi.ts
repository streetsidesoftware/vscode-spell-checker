import { Connection, NotificationType, RequestType } from 'vscode-languageserver';
import {
    ClientNotifications,
    ClientNotificationsApi,
    OnSpellCheckDocumentStep,
    Req,
    RequestsToClient,
    RequestsToClientApi,
    Res,
    WorkspaceConfigForDocumentRequest,
} from './api';

export interface ClientApi extends ClientNotificationsApi, RequestsToClientApi {}

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
        onSpellCheckDocument: (param: OnSpellCheckDocumentStep) => sendNotification('onSpellCheckDocument', param),
        onWorkspaceConfigForDocumentRequest: (param: WorkspaceConfigForDocumentRequest) =>
            sendRequest('onWorkspaceConfigForDocumentRequest', param),
    };
}
