import type { MessageConnection } from 'json-rpc-api';
import { createDisposable } from 'utils-disposables';
import { describe, expect, test, vi } from 'vitest';

import type { ClientSideApiDef } from './api';
import * as api from './api';

describe('api', () => {
    test('api', () => {
        expect(Object.keys(api).sort()).toMatchSnapshot();
    });

    test('Creating a Server API', () => {
        const connection = getConnection();
        const clientInterface: ClientSideApiDef = {
            clientNotifications: {
                onStateChange: true,
            },
            clientRequests: {},
            serverNotifications: {
                showInformationMessage: true,
                openTextDocument: true,
            },
            serverRequests: {
                getCurrentDocument: true,
                getDocSettings: true,
                getLogDebug: true,
                getTodos: true,
                resetTodos: true,
                setLogDebug: true,
                setTodos: true,
                watchFields: true,
                whatTimeIsIt: true,
            },
        };
        const client = api.createClientSideSpellInfoWebviewApi(connection, clientInterface, undefined);
        expect(client).toBeDefined();
        expect(client.serverRequest.getTodos).toBeTypeOf('function');
        const fn: (...p: any) => any = client.serverRequest.setTodos;
        expect(fn).toBeTypeOf('function');
        const methods = Object.entries(client).flatMap(([key, value]) =>
            Object.entries(value).map(([k, v]) => [key + '.' + k, v] as const),
        );
        const methodMap = Object.fromEntries(methods);
        expect(Object.keys(methodMap).sort()).toMatchSnapshot();
        expect(Object.values(methodMap).map((fn) => typeof fn)).toMatchSnapshot();
    });
});

function getConnection(): MessageConnection {
    const c: MessageConnection = {
        onNotification: vi.fn(() => createDisposable(vi.fn())),
        onRequest: vi.fn(() => createDisposable(vi.fn())),
        sendNotification: vi.fn(() => Promise.resolve()),
        sendRequest: vi.fn((() => Promise.resolve()) as () => Promise<any>),
    };
    return c;
}
