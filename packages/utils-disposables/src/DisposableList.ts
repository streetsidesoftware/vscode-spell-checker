import type { DisposableHybrid, DisposableLike } from './disposable.js';
import { createDisposeMethodFromList, symbolIsDisposed } from './disposable.js';

/** This is a class that can be inherited to provide Disposable support. */

export const noop = () => undefined;

export class InheritableDisposable implements DisposableHybrid {
    public dispose: () => void;
    public [Symbol.dispose]: () => void = noop;
    public [symbolIsDisposed]: boolean = false;

    /** the inherited class can safely add disposables to _disposables */
    protected readonly _disposables: DisposableLike[];
    constructor(disposables?: DisposableLike[], name = 'InheritableDisposable') {
        this._disposables = disposables ?? [];
        const _dispose = createDisposeMethodFromList(this._disposables, name);
        const dispose = () => {
            if (this.isDisposed()) return;
            this[symbolIsDisposed] = true;
            _dispose();
            // Prevent new disposables from being added.
            Object.freeze(this._disposables);
        };
        this.dispose = dispose;
        this[Symbol.dispose] = dispose;
    }

    protected isDisposed(): boolean {
        return this[symbolIsDisposed];
    }
}

export class DisposableList extends InheritableDisposable {
    #known: WeakSet<DisposableLike>;

    constructor(
        public readonly disposables: DisposableLike[] = [],
        readonly name = 'DisposableList',
    ) {
        super(disposables);
        this.#known = new WeakSet(disposables);
    }

    /**
     * pushes
     * @param disposables
     * @returns
     */
    public push(...disposables: DisposableLike[]) {
        if (this.isDisposed()) {
            throw new Error('Already disposed, cannot add items.');
        }
        let count = 0;
        for (const d of disposables) {
            this.add(d) && count++;
        }
        return count;
    }

    /**
     * Add a disposable to the list.
     * Duplicates will not be added.
     * @param disposable to add.
     * @returns true if the disposable was added.
     */
    public add(disposable: DisposableLike | undefined): boolean {
        if (!disposable) return false;
        if (this.#known.has(disposable)) return false;
        this.#known.add(disposable);
        this.disposables.push(disposable);
        return true;
    }

    /**
     * Delete a disposable from the list. It does NOT dispose of the disposable.
     * @param disposable - the disposable to delete.
     * @returns false if the disposable was not found.
     */
    public delete(disposable: DisposableLike | undefined) {
        if (!disposable) return true;
        this.#known.delete(disposable);
        const index = this.disposables.indexOf(disposable);
        if (index < 0) return false;
        this.disposables.splice(index, 1);
        return true;
    }

    get length() {
        return this.disposables.length;
    }

    public isDisposed(): boolean {
        return super.isDisposed();
    }

    public has(disposable: DisposableLike | undefined): boolean {
        if (!disposable) return false;
        return this.#known.has(disposable);
    }
}

export function createDisposableList(disposables?: DisposableLike[], name?: string): DisposableList {
    return new DisposableList(disposables, name);
}
