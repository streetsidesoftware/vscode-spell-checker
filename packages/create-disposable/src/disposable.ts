// Poly fill

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Symbol.dispose ??= Symbol('Symbol.dispose');
// Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

export interface Disposable {
    /**
     * Dispose this object.
     */
    dispose(): void;
    [Symbol.dispose](): void;
}

export type DisposableLike = Disposable | Omit<Disposable, 'dispose'> | Omit<Disposable, typeof Symbol.dispose>;

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
export function createDisposable<T extends object>(disposeFn: () => void, thisArg?: T): Disposable {
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
export function injectDisposable<T extends object>(obj: T, dispose: () => void): T & Disposable {
    return Object.assign(obj, createDisposable(dispose, obj));
}

/**
 * Create a Disposable that will dispose the list of disposables.
 * @param disposables - list of Disposables
 * @returns A Disposable
 */
export function createDisposableFromList(disposables: DisposableLike[]) {
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

        let disposable: Partial<Disposable> | undefined;

        // Note disposables are disposed in reverse order by default.
        while ((disposable = disposables.pop())) {
            try {
                if (disposable[Symbol.dispose]) {
                    disposable[Symbol.dispose]?.call(disposable);
                    continue;
                }
                disposable.dispose?.call(disposable);
            } catch (e) {
                error ??= e;
            }
        }

        if (error) throw error;
    }
    return dispose;
}
