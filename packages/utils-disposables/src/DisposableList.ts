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
    constructor(
        public readonly disposables: DisposableLike[] = [],
        readonly name = 'DisposableList',
    ) {
        super(disposables);
    }

    public push(...disposables: DisposableLike[]) {
        if (this.isDisposed()) {
            throw new Error('Already disposed, cannot add items.');
        }
        this.disposables.push(...disposables);
    }

    get length() {
        return this.disposables.length;
    }

    public isDisposed(): boolean {
        return super.isDisposed();
    }
}

export function createDisposableList(disposables?: DisposableLike[], name?: string): DisposableList {
    return new DisposableList(disposables, name);
}
