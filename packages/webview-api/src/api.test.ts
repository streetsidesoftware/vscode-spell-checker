import { createDisposable } from 'create-disposable';
import { describe, expect, test, vi } from 'vitest';
import type { MessageConnection } from 'vscode-jsonrpc';

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
                onChangeAppState: true,
            },
            clientRequests: {},
            serverNotifications: {
                showInformationMessage: true,
            },
            serverRequests: {
                getAppState: true,
                whatTimeIsIt: true,
                updateAppState: true,
                resetTodos: true,
            },
        };
        const client = api.createClientSideHelloWorldApi(connection, clientInterface);
        expect(client).toBeDefined();
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
        hasPendingResponse: vi.fn(() => false),
        onClose: vi.fn(() => createDisposable(vi.fn())),
        onDispose: vi.fn(() => createDisposable(vi.fn())),
        onError: vi.fn(() => createDisposable(vi.fn())),
        onNotification: vi.fn(() => createDisposable(vi.fn())),
        onProgress: vi.fn(() => createDisposable(vi.fn())),
        onRequest: vi.fn(() => createDisposable(vi.fn())),
        onUnhandledNotification: vi.fn(() => createDisposable(vi.fn())),
        onUnhandledProgress: vi.fn(() => createDisposable(vi.fn())),
        sendNotification: vi.fn(() => Promise.resolve()),
        sendRequest: vi.fn(() => Promise.resolve()),
        sendProgress: vi.fn(() => Promise.resolve()),
        trace: vi.fn(() => Promise.resolve()),
        listen: vi.fn(),
        end: vi.fn(),
        inspect: vi.fn(),
        dispose: vi.fn(),
    };
    return c;
}
