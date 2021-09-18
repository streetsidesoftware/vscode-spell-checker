import { BaseMessageEvent, WebviewApi } from './WebviewApi';
import { Commands, isMessage, CommandMessage } from './message';
import { DefinedCommands, isMessageOf } from '.';

export interface MsgListener<M extends CommandMessage> {
    cmd: M['command'];
    fn: (msg: CommandMessage) => void;
    dispose(): void;
}

type MessageHandler<M extends CommandMessage> = (message: M) => void;

type KnownListeners = {
    [K in keyof DefinedCommands]: MsgListener<DefinedCommands[K]>;
};

type Listener = KnownListeners[keyof KnownListeners];

export interface Messenger {
    listenFor<M extends CommandMessage>(cmd: M['command'], fn: (message: M) => void): Listener;
    postMessage<M extends CommandMessage>(msg: M): void;
}

export type Logger = {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
};

export class MessageBus implements Messenger {
    protected listeners = new Map<Commands, Set<Listener>>();

    constructor(readonly vsCodeApi: WebviewApi, public logger: Logger = console) {
        this.vsCodeApi.onmessage = (msg: BaseMessageEvent) => this.respondToMessage(msg);
    }

    listenFor<M extends CommandMessage>(cmd: M['command'], fn: MessageHandler<M>): Listener {
        function handler(msg: CommandMessage) {
            if (isMessageOf<M>(msg)) {
                fn(msg);
            }
        }

        const listener: Listener = {
            fn: handler,
            cmd,
            dispose: () => {
                this.listeners.has(cmd) && this.listeners.get(cmd)!.delete(listener);
            },
        };

        this.listeners.set(cmd, this.listeners.get(cmd) || new Set());
        const cmdListeners = this.listeners.get(cmd)!;
        cmdListeners.add(listener);

        return listener;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    postMessage<M extends CommandMessage>(msg: M) {
        this.vsCodeApi.postMessage(msg);
    }

    private respondToMessage(msg: BaseMessageEvent) {
        const message = msg.data;

        if (!isMessage(message)) {
            this.logger.error('Unknown message: %o', msg);
            return;
        }

        const listeners = this.listeners.get(message.command);

        if (!listeners) {
            this.logger.error('Unhandled message: %o', msg);
            return;
        }

        for (const listener of listeners) {
            listener.fn(message);
        }
    }
}
