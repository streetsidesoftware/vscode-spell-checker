
export class CancelablePromise<T> implements Promise<T> {
    private _resolved: 'resolved' | 'rejected' | 'canceled' | undefined;
    private _canceledReason: CanceledPromiseReason | undefined;
    private _promise: Promise<T>;

    get isCanceled() { return this._resolved === 'canceled'; }

    constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
        let _resolve: (value?: T | PromiseLike<T>) => void = () => {};
        let _reject: (reason?: any) => void = () => {};
        this._promise = new Promise<T>((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
        });
        this._promise.catch(() => {});

        const resolvePromise = (values?: T | PromiseLike<T>) => {
            if (this.isCanceled) {
                return _reject(this._canceledReason);
            }
            this._resolved = 'resolved';
            _resolve(values);
        }

        const rejectPromise = (reason?: any) => {
            if (this.isCanceled) {
                return _reject(this._canceledReason);
            }
            this._canceledReason = isCanceledPromiseRejection(reason) ? reason : undefined;
            this._resolved = this._canceledReason ? 'canceled' : 'rejected';
            _reject(reason);
        }

        executor(resolvePromise, rejectPromise);
    }

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): CancelablePromise<TResult1 | TResult2> {
        return CancelablePromise.resolve(this._promise.then(onfulfilled, onrejected));
    }

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): CancelablePromise<T | TResult> {
        return this.then(undefined, onrejected);
    }

    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): CancelablePromise<T> {
        return CancelablePromise.resolve(this._promise.finally(onfinally));
    }

    /**
     * Cancel a Promise if it has not already been resolved or rejected.
     * The Promise will be immediately rejected with a CanceledPromiseRejection containing the reason.
     * @param reason
     */
    cancel(reason: any) {
        if (!this._resolved) {
            this._resolved = 'canceled';
            this._canceledReason = CanceledPromiseReason.from(reason);
        }
        return this;
    }

    get [Symbol.toStringTag]() {
        return 'CancelablePromise';
    }

    /**
     * Creates a new resolved promise .
     * @returns A resolved promise.
     */
    static resolve(): Promise<void>;

    /**
     * Creates a new resolved promise for the provided value.
     * @param value A promise.
     * @returns A promise whose internal state matches the provided promise.
     */
    static resolve<U>(v: U | Promise<U>): CancelablePromise<U>;

    static resolve<U>(v?: U | Promise<U>): CancelablePromise<U> {
        return new CancelablePromise<U>((resolve, reject) => {
            const promise = Promise.resolve(v);
            promise.then(resolve, reject).catch(_ => true);
        });
    }

    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    static reject<U>(reason: any): CancelablePromise<U> {
        return CancelablePromise.resolve(Promise.reject(reason));
    }
}

export class CanceledPromiseReason<T=any> {
    private _reason: T;
    constructor(reason: T) {
        this._reason = reason;
    }

    get reason() { return this._reason; }

    static from<U>(reason: U | CanceledPromiseReason<U>) {
        return isCanceledPromiseRejection(reason) ? reason : new CanceledPromiseReason(reason);
    }
}

export function isCanceledPromiseRejection(p: any): p is CanceledPromiseReason {
    return p && p instanceof CanceledPromiseReason;
}
