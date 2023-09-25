// Poly fill

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Symbol.dispose ??= Symbol('Symbol.dispose');
// Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

interface Disposable {
    [Symbol.dispose](): void;
}

export type DisposeFn = () => void;

export interface DisposableHybrid {
    /**
     * Dispose this object.
     */
    dispose(): void;
    [Symbol.dispose](): void;
}

export interface DisposableClassic {
    /**
     * Dispose this object.
     */
    dispose(): void;
}

export type DisposableProposed = Disposable;

export type DisposableLike = DisposableHybrid | DisposableClassic | DisposableProposed;

// export interface AsyncDisposable {
//   asyncDispose(): void;
//   [Symbol.asyncDispose](): PromiseLike<void>;
// }

/**
 * Create a Disposable object.
 * @param disposeFn - function to call when this option is disposed.
 * @param thisArg - optional this value
 * @returns A Disposable
 */
export function createDisposable<T extends object>(disposeFn: DisposeFn, thisArg?: T): DisposableHybrid {
    // We want to prevent double disposal calls.
    // This can happen if there are multiple systems calling dispose.
    let isDisposed = false;

    function dispose() {
        if (isDisposed) return;
        isDisposed = true;
        thisArg ? disposeFn.call(thisArg) : disposeFn();
    }

    return {
        dispose,
        [Symbol.dispose]: dispose,
    };
}

/**
 * Make and object Disposable by adding disposable properties.
 * @param obj - Object to modify
 * @param dispose - the dispose function.
 * @returns the same object.
 */
export function injectDisposable<T extends object>(obj: T, dispose: () => void): T & DisposableHybrid {
    return Object.assign(obj, createDisposable(dispose, obj));
}

/**
 * Create a Disposable that will dispose the list of disposables.
 * @param disposables - list of Disposables
 * @returns A Disposable
 */
export function createDisposableFromList(disposables: DisposableLike[]): DisposableHybrid {
    return createDisposable(createDisposeMethodFromList(disposables));
}

/**
 * Create a disposeFn based upon a list of disposables.
 * @param disposables - list of Disposables
 * @returns A dispose function
 */
export function createDisposeMethodFromList(disposables: DisposableLike[]): () => void {
    function dispose() {
        let error: unknown | undefined = undefined;

        let disposable: DisposableLike | undefined;

        // Note disposables are disposed in reverse order by default.
        while ((disposable = disposables.pop())) {
            try {
                disposeOf(disposable);
            } catch (e) {
                error ??= e;
            }
        }

        if (error) throw error;
    }
    return dispose;
}

/**
 * Dispose of a disposable.
 * @param disposable - Disposable or function to call.
 * @returns void
 */
export function disposeOf(disposable: DisposableLike | DisposeFn): void {
    if (typeof disposable === 'function') {
        disposable();
        return;
    }
    const _disposable = disposable as DisposableHybrid;
    if (typeof _disposable[Symbol.dispose] === 'function') {
        _disposable[Symbol.dispose].call(disposable);
        return;
    }
    _disposable.dispose.call(disposable);
}
