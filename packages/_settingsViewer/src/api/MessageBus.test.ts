import { describe, expect, test, vi } from 'vitest';

import { sampleSettings } from '../test/samples/sampleSettings';
import type { ConfigurationChangeMessage, RequestConfigurationMessage } from './message';
import type { Logger } from './MessageBus';
import { MessageBus } from './MessageBus';
import type { WebviewApi } from './WebviewApi';

type ANY = any;

describe('Validate MessageBus', () => {
    test('constructor', () => {
        const webviewApi: WebviewApi = {
            postMessage: (_msg: ANY) => webviewApi,
            onmessage: undefined,
        };

        expect(new MessageBus(webviewApi).vsCodeApi).toBe(webviewApi);
    });

    test('postMessage', () => {
        const postMessageMock = vi.fn((msg: ANY) => loopBack(webviewApi, msg));
        const webviewApi: WebviewApi = {
            postMessage: postMessageMock,
            onmessage: undefined,
        };

        const logger = mockLogger();
        const bus = new MessageBus(webviewApi, logger);
        bus.postMessage({ command: 'SelectFileMessage', value: '/file.txt' });
        expect(postMessageMock.mock.calls.length).toBe(1);
        expect(logger.error).toBeCalledTimes(1);
    });

    test('listener', () => {
        const webviewApi: WebviewApi = {
            postMessage: (msg: ANY) => loopBack(webviewApi, msg),
            onmessage: undefined,
        };
        const onRequestConfigurationMessage = vi.fn((_msg: RequestConfigurationMessage) => undefined);
        const onConfigurationChangeMessage = vi.fn((_msg: ConfigurationChangeMessage) => undefined);
        const logger = mockLogger();
        const bus = new MessageBus(webviewApi, logger);
        const listenerA = bus.listenFor('RequestConfigurationMessage', onRequestConfigurationMessage);
        const listenerB = bus.listenFor('ConfigurationChangeMessage', onConfigurationChangeMessage);

        bus.postMessage({ command: 'RequestConfigurationMessage' });
        bus.postMessage({ command: 'ConfigurationChangeMessage', value: { settings: sampleSettings } });
        bus.postMessage({ command: 'SelectFileMessage', value: '/file.txt' });

        expect(onRequestConfigurationMessage.mock.calls.length).toBe(1);
        expect(onConfigurationChangeMessage.mock.calls.length).toBe(1);

        listenerA.dispose();

        bus.postMessage({ command: 'RequestConfigurationMessage' });
        bus.postMessage({ command: 'ConfigurationChangeMessage', value: { settings: sampleSettings } });
        bus.postMessage({ command: 'SelectFileMessage', value: '/file.txt' });

        expect(onRequestConfigurationMessage.mock.calls.length).toBe(1);
        expect(onConfigurationChangeMessage.mock.calls.length).toBe(2);

        listenerB.dispose();

        bus.postMessage({ command: 'RequestConfigurationMessage' });
        bus.postMessage({ command: 'ConfigurationChangeMessage', value: { settings: sampleSettings } });
        bus.postMessage({ command: 'SelectFileMessage', value: '/file.txt' });

        expect(onRequestConfigurationMessage.mock.calls.length).toBe(1);
        expect(onConfigurationChangeMessage.mock.calls.length).toBe(2);
        expect(logger.error).toBeCalledTimes(3);
    });

    test('receiving non-message path', () => {
        const webviewApi: WebviewApi = {
            postMessage: (msg: ANY) => loopBack(webviewApi, msg),
            onmessage: undefined,
        };
        const logger = mockLogger();
        new MessageBus(webviewApi, logger);
        expect(() => webviewApi.onmessage?.({ data: {} })).not.toThrow();
        expect(logger.error).toBeCalledTimes(1);
    });
});

function loopBack(webviewApi: WebviewApi, msg: ANY): WebviewApi {
    if (webviewApi.onmessage) {
        webviewApi.onmessage({ data: msg });
    }
    return webviewApi;
}

function mockLogger(): Logger {
    return {
        log: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    };
}
