import { WebviewApi } from './WebviewApi';
import { Message, Commands, isMessage, Messages } from './message';

export interface Listener {
    cmd: Commands;
    fn: (message: Message) => void;
    dispose(): void;
}

export interface Messenger {
    listenFor<M extends Messages>(cmd: M['command'], fn: (message: M) => void): Listener;
    postMessage<M extends Messages>(msg: M): void;
}

export class MessageBus implements Messenger {
    protected listeners = new Map<Commands, Set<Listener>>();

    constructor(readonly vsCodeApi: WebviewApi) {
        this.vsCodeApi.onmessage = (msg: MessageEvent) => this.respondToMessage(msg);
    }

    listenFor<M extends Messages>(cmd: M['command'], fn: (message: M) => any): Listener {
        const listener = {
            fn,
            cmd,
            dispose: () => this.listeners.has(cmd) && this.listeners.get(cmd)!.delete(listener),
        };

        this.listeners.set(cmd, this.listeners.get(cmd) || new Set());
        const cmdListeners = this.listeners.get(cmd)!;
        cmdListeners.add(listener);

        return listener;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    postMessage<M extends Messages>(msg: M) {
        this.vsCodeApi.postMessage(msg);
    }

    private respondToMessage(msg: MessageEvent) {
        const message = msg.data;

        if (!isMessage(message)) {
            console.error('Unknown message: %o', msg);
            return;
        }

        const listeners = this.listeners.get(message.command);

        if (!listeners) {
            console.error('Unhandled message: %o', msg);
            return;
        }

        for (const listener of listeners) {
            listener.fn(message);
        }
    }
}
