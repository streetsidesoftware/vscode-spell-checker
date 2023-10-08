import { describe, expect, test, vi } from 'vitest';

import type { MessageConnection } from '../../src/types.js';
import type { ClientSideApiDef, ServerSideApiDef } from './api.js';
import { createClientSideTodoApi, createServerSideTodoApi } from './api.js';

describe('client', () => {
    test('createClientSideTodoApi', () => {
        const connection = createConnection();
        const apiDef: ClientSideApiDef = {
            serverNotifications: {
                todoOpened: true,
            },
            serverRequests: {
                whatTimeIsIt: true,
                getTodos: true,
                updateTodo: true,
                addTodos: true,
            },
            clientNotifications: {
                todoUpdated: true,
            },
            clientRequests: {},
        };
        const api = createClientSideTodoApi(connection, apiDef);
        expect(api).toBeDefined();
        expect(connection.onNotification).toHaveBeenCalled();
        expect(connection.onRequest).not.toHaveBeenCalled();
        expect(connection.sendRequest).not.toHaveBeenCalled();
        expect(connection.sendNotification).not.toHaveBeenCalled();
    });
});

describe('server', () => {
    test('createServerSideTodoApi', () => {
        const connection = createConnection();
        const apiDef: ServerSideApiDef = {
            serverNotifications: {
                todoOpened: () => undefined,
            },
            serverRequests: {
                whatTimeIsIt: () => new Date().toISOString(),
                getTodos: () => [],
                updateTodo: () => [],
                addTodos: () => [],
            },
            clientNotifications: {
                todoUpdated: true,
            },
            clientRequests: {},
        };
        const api = createServerSideTodoApi(connection, apiDef);
        expect(api).toBeDefined();
        expect(connection.onNotification).toHaveBeenCalled();
        expect(connection.onRequest).toHaveBeenCalled();
        expect(connection.sendRequest).not.toHaveBeenCalled();
        expect(connection.sendNotification).not.toHaveBeenCalled();
    });
});

function createConnection(): MessageConnection {
    return {
        sendRequest: vi.fn(),
        sendNotification: vi.fn(),
        onNotification: vi.fn(),
        onRequest: vi.fn(),
    };
}
