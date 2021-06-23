import { Connection, NotificationType } from 'vscode-languageserver';
import { ClientNotifications, ClientNotificationsApi, OnSpellCheckDocumentStep } from './api';

export function createClientNotificationApi(connection: Connection): ClientNotificationsApi {
    function sendNotification<M extends keyof ClientNotifications>(method: M, param: ClientNotifications[M]) {
        type P = ClientNotifications[M];
        const n = new NotificationType<P>(method);
        connection.sendNotification(n, param);
    }

    return {
        onSpellCheckDocument: (param: OnSpellCheckDocumentStep) => sendNotification('onSpellCheckDocument', param),
    };
}
