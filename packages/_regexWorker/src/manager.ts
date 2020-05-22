import { Worker } from 'worker_threads';
import { Command, Response, CommandEcho, isResponse, CommandEvaluateRegExp, ResponseEvaluateRegExp } from './commands';
import * as Path from 'path';
import { RegExpOrString, EvalRegExpResult } from './evaluateRegExp';


export class Manager {
    private id: number;
    private pending: Map<number, (v: Response) => any>;
    private worker: Worker;
    public dispose: () => Promise<number>;
    constructor(dirname: string = __dirname) {
        this.id = 0;
        this.dispose = () => this._dispose();
        this.worker = new Worker(Path.join(dirname, 'worker.js'));
        this.pending = new Map();
        this.worker.on('message', v => this.listener(v))
    }

    private _dispose() {
        this.worker.removeAllListeners();
        return this.worker.terminate();
    }

    private send<T extends Command, U extends Response>(c: T): Promise<U> {
        return new Promise<U>((resolve) => {
            this.pending.set(c.id, v => resolve(v as U));
            this.worker.postMessage(c);
        });
    }

    private listener(m: any) {
        if (isResponse(m)) {
            this.pending.get(m.id)?.(m);
            this.pending.delete(m.id);
        }
    }

    echo(text: string): Promise<string> {
        const id = ++this.id;
        const command: CommandEcho = {
            id,
            commandType: 'Echo',
            data: text,
        }
        return this.send(command).then(v => v.data);
    }

    evaluateRegExp(regexp: RegExpOrString, text: string): Promise<EvalRegExpResult> {
        const id = ++this.id;
        const command: CommandEvaluateRegExp = {
            id,
            commandType: 'EvaluateRegExp',
            data: {
                regexp, text
            }
        }

        return this.send(command).then((v: ResponseEvaluateRegExp) => v.data)
    }
}
