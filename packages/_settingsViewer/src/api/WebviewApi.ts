import type { EXPLICIT_ANY } from '../types';

export interface BaseMessageEvent {
    data: EXPLICIT_ANY;
}

export interface Disposable {
    dispose: () => EXPLICIT_ANY;
}

export type MessageListener = (e: BaseMessageEvent) => EXPLICIT_ANY;

export interface WebviewApi {
    postMessage(msg: EXPLICIT_ANY): WebviewApi;
    onmessage: MessageListener | undefined;
    disposable?: Disposable;
}
