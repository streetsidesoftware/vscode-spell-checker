import stream from 'node:stream';

import type * as vscode from 'vscode';

export function emitterToWriteStream(emitter: vscode.EventEmitter<string>): stream.Writable {
    return new stream.Writable({
        write: (chunk, _encoding, callback) => {
            emitter.fire(chunk.toString());
            callback();
        },
    });
}

class ReadableEmitter extends stream.Readable {
    private buffer: string[] = [];
    private paused = true;
    private disposable: vscode.Disposable;
    constructor(emitter: vscode.EventEmitter<string>) {
        super({});
        this.disposable = emitter.event((data) => {
            this.buffer.push(data);
            this.pushBuffer();
        });
    }

    _read() {
        this.paused = false;
        this.pushBuffer();
    }

    _destroy() {
        this.disposable.dispose();
    }

    private pushBuffer() {
        if (this.paused) return;
        for (let data = this.buffer.shift(); data !== undefined && !this.paused; data = this.buffer.shift()) {
            this.push(data);
        }
    }
}

export function emitterToReadStream(emitter: vscode.EventEmitter<string>): stream.Readable {
    return new ReadableEmitter(emitter);
}
