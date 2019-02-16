import { VsCodeWebviewApi, WebviewApi } from './vscode/VsCodeWebviewApi';
import { Message, Commands, isMessage, Messages } from './message';

export interface Listener {
    cmd: Commands;
    fn: (message: Message) => any;
    dispose(): void;
}

export class MessageBus {
    readonly vsCodeApi: WebviewApi;
    protected listeners = new Map<Commands, Set<Listener>>();

    constructor(_vsCodeApi?: WebviewApi) {
        this.vsCodeApi = _vsCodeApi || new VsCodeWebviewApi();
        this.vsCodeApi.onmessage = (msg: MessageEvent) => this.respondToMessage(msg);
    }

    listenFor<M extends Message>(cmd: M['command'], fn: (message: M) => any): Listener {
        const listener = {
            fn,
            cmd,
            dispose: () => this.listeners.has(cmd) && this.listeners.get(cmd)!.delete(listener),
        }

        this.listeners.set(cmd, this.listeners.get(cmd) || new Set());
        const cmdListeners = this.listeners.get(cmd)!;
        cmdListeners.add(listener);

        return listener;
    }

    postMessage<M extends Messages>(msg: M) {
        this.vsCodeApi.postMessage(msg);
    }

    private respondToMessage(msg: MessageEvent) {
        const message = msg.data;

        if (!isMessage(message)) {
            return;
        }

        const listeners = this.listeners.get(message.command);

        if (!listeners) {
            return;
        }

        for (const listener of listeners) {
            listener.fn(message);
        }
    }
}