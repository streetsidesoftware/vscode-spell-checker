/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AbstractMessageReader,
    AbstractMessageWriter,
    createMessageConnection,
    type DataCallback,
    type Disposable,
    type Message,
    type MessageConnection,
    type MessageWriter,
} from 'vscode-jsonrpc/browser';

import { getVsCodeApi, type VSCodeAPI, type VSCodeMessageAPI } from './vscode.js';

export type { MessageConnection } from 'json-rpc-api';
export { NotificationType } from 'vscode-jsonrpc/lib/common/api.js';

export interface Logger {
    debug: typeof console.debug;
    error: typeof console.error;
    info: typeof console.info;
    log: typeof console.log;
    warn: typeof console.warn;
}

export class WebViewMessageReader extends AbstractMessageReader {
    constructor(
        readonly api: VSCodeMessageAPI,
        readonly logger: Logger | undefined,
    ) {
        super();
    }

    listen(callback: DataCallback): Disposable {
        return this.api.onDidReceiveMessage((data) => {
            if (!data || !data.data) return;
            this.logger?.debug('client listen: %o', data.data);
            callback(data.data);
        });
    }
}

export class WebViewMessageWriter extends AbstractMessageWriter implements MessageWriter {
    private errorCount: number;

    constructor(
        readonly api: VSCodeMessageAPI,
        readonly logger: Logger | undefined,
    ) {
        super();
        this.errorCount = 0;
    }

    public async write(msg: Message): Promise<void> {
        try {
            await this.api.postMessage(msg);
            this.errorCount = 0;
        } catch (error) {
            this.handleError(error, msg);
            return Promise.reject(error);
        }
    }

    private handleError(error: any, msg: Message): void {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
    }

    public end(): void {
        /* empty */
    }
}

function createConnectionToVSCode(api: VSCodeMessageAPI, logger: Logger | undefined): MessageConnection {
    return createMessageConnection(new WebViewMessageReader(api, logger), new WebViewMessageWriter(api, logger), logger);
}

let connection: MessageConnection | undefined = undefined;

export function getRpcConnection<T>(api?: VSCodeAPI<T>, logger?: Logger): MessageConnection {
    if (connection) return connection;
    connection = createConnectionToVSCode(api || getVsCodeApi(), logger);
    return connection;
}
