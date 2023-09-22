import assert from 'assert';

export enum ResolutionState {
    pending,
    resolved,
    rejected,
}

export class Resolvable<T> {
    private _attached: Promise<T> | undefined = undefined;
    private _resolve: (value: T) => void = () => undefined;
    private _reject: (reason?: unknown) => void = () => undefined;
    private _promise: Promise<T>;
    constructor() {
        this._promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    get promise() {
        return this._promise;
    }

    public attach(value: Promise<T>): void {
        if (this._attached === value) return;
        assert(this._attached === undefined, 'Already Resolved');
        this._attached = value;
        this._attached.then(this._resolve, this._reject).catch(() => undefined);
    }

    public isPending(): boolean {
        return !this._attached;
    }

    public isResolved(): boolean {
        return !this.isPending();
    }
}
