export interface BaseMessageEvent {
    data: any;
}

export interface Disposable {
    dispose: () => any;
}

export type MessageListener = (e: BaseMessageEvent) => any;

export interface WebviewApi {
    postMessage(msg: any): WebviewApi;
    onmessage: MessageListener | undefined;
    disposable?: Disposable;
}
