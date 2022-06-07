import assert from 'assert';

export enum ResolutionState {
    pending,
    resolved,
    rejected,
}

export class Resolvable<T> {
    private resolutionState: ResolutionState = ResolutionState.pending;
    private resolution: { value: T | PromiseLike<T> } | { reject: any } | undefined;
    private _resolve?: (value: T | PromiseLike<T>) => void;
    private _reject?: (reason?: any) => void;
    readonly promise: Promise<T>;
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
            assert(this.resolution === undefined, 'Already Resolved'); // Maybe handle this later.
        });
    }

    public resolve(value: T | PromiseLike<T>): void {
        assert(this.resolution === undefined, 'Already Resolved');
        this.resolution = { value };
        this._resolve?.(value);
        this.resolutionState = ResolutionState.resolved;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public reject(reject: any): void {
        assert(this.resolution === undefined, 'Already Resolved');
        this.resolution = { reject };
        this._reject?.(reject);
        this.resolutionState = ResolutionState.rejected;
    }

    public isPending(): boolean {
        return this.resolutionState === ResolutionState.pending;
    }

    public isResolved(): boolean {
        return this.resolutionState === ResolutionState.resolved;
    }

    public isRejected(): boolean {
        return this.resolutionState === ResolutionState.rejected;
    }
}
