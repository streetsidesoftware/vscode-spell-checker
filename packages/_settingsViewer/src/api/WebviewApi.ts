export interface BaseMessage {
    data: any;
}

export interface Disposable {
    dispose: () => any;
}

export type MessageListener = (e: BaseMessage) => any;

export interface WebviewApi {
    postMessage(msg: any): WebviewApi;
    onmessage: MessageListener | undefined;
    disposable?: Disposable;
}
