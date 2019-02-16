// interface VsCodeWebviewAPI extends BroadcastChannel { }

interface VsCodeAPI {
    postMessage(msg: any): void;
    // setState(state: any): void;
    // getState(): any;
}

declare function acquireVsCodeApi(): VsCodeAPI;

export const channelName = 'settingsViewer';

export interface BaseMessage {
    data: any;
}

export type MessageListener = (e: BaseMessage) => any;

const vsCodeApi = acquireAPI();
const listeners: MessageListener[] = [];

export interface WebviewApi {
    postMessage(msg: any): WebviewApi;
    onmessage: MessageListener | undefined;
}

export class VsCodeWebviewApi implements WebviewApi {
    private _onmessage?: MessageListener;

    postMessage(msg: any): VsCodeWebviewApi {
        vsCodeApi.postMessage(msg);
        return this;
    }

    get onmessage(): MessageListener | undefined {
        return this._onmessage;
    }

    set onmessage(listener: MessageListener | undefined) {
        const found = listeners.findIndex(v => v === this._onmessage);
        if (found >= 0) {
            listeners.splice(found, 1);
        }
        if (listener) {
            listeners.push(listener);
        }
        this._onmessage = listener;
    }
}

function acquireVsCodeWebviewAPI(): VsCodeAPI | undefined {
    try {
        return acquireVsCodeApi();
    } catch (e) {
        if (!(e instanceof ReferenceError)) {
            throw e;
        }
    }
    return undefined;
}

function onMessage(message: MessageEvent) {
    listeners.forEach(fn => fn(message));
}

function acquireAPI(): VsCodeAPI {
    const vsCodeApi = acquireVsCodeWebviewAPI();
    if (vsCodeApi) {
        window.addEventListener('message', onMessage);
        return {
            postMessage(msg: any) {
                vsCodeApi.postMessage(msg);
            }
        };
    }

    if (typeof BroadcastChannel !== 'function') {
        return {
            postMessage() {}
        };
    }

    const channel = new BroadcastChannel(channelName);
    channel.onmessage = onMessage;
    return channel;
}
