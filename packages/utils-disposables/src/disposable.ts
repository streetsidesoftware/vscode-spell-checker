// Poly fill

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Symbol.dispose ??= Symbol('Symbol.dispose');
// Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

interface Disposable {
    [Symbol.dispose](): void;
}

export interface Logger {
    debug: typeof console.debug;
    warn: typeof console.warn;
}

export const symbolDisposableName = Symbol('Disposable Name');
export type SymbolDisposableName = typeof symbolDisposableName;

export const symbolDisposableTs = Symbol('Disposable Timestamp');
export type SymbolDisposableTs = typeof symbolDisposableTs;

export const symbolIsDisposed = Symbol('Disposable Is Disposed');
export type SymbolIsDisposed = typeof symbolIsDisposed;

let _logger: Logger | undefined = undefined;

let debugDepth = 0;
let activeDisposables = 0;

export type DisposeFn = () => void;

export interface DisposableHybrid {
    /**
     * Dispose this object.
     */
    dispose(): void;
    [Symbol.dispose](): void;
    /**
     * The name of the disposable, used for debugging purposes.
     * It can be helpful to trace the origins of the disposable.
     */
    [symbolDisposableName]?: string;
    /**
     * The timestamp, see: [Performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)
     */
    [symbolDisposableTs]?: number;

    /**
     * Indicates if the disposable has been disposed.
     */
    [symbolIsDisposed]?: boolean;
}

export interface DisposableClassic {
    /**
     * Dispose this object.
     */
    dispose(): void;
}

export type DisposableProposed = Disposable;

export type DisposableLike = DisposableHybrid | DisposableClassic | DisposableProposed | DisposeFn;

// export interface AsyncDisposable {
//   asyncDispose(): void;
//   [Symbol.asyncDispose](): PromiseLike<void>;
// }

/**
 * Create a Disposable object.
 * @param disposeFn - function to call when this option is disposed.
 * @param thisArg - optional this value
 * @param name - optional debug name
 * @returns A Disposable
 */
export function createDisposable<T extends object>(disposeFn: DisposeFn, thisArg?: T, name?: string): DisposableHybrid {
    // We want to prevent double disposal calls.
    // This can happen if there are multiple systems calling dispose.
    let isDisposed = false;
    let errors = false;

    const disposable: DisposableHybrid = {
        dispose,
        [Symbol.dispose]: dispose,
        [symbolDisposableTs]: performance.now(),
        [symbolDisposableName]: name || undefined,
        [symbolIsDisposed]: false,
    };

    ++activeDisposables;
    _logger?.debug(dbgPad() + 'Created: %s, active: %i', debugId(disposable), activeDisposables);

    return disposable;

    function dispose() {
        try {
            _logger?.debug(dbgPad() + 'Dispose Start -> %s Active %i', debugId(disposable), activeDisposables);
            ++debugDepth;
            // isDisposed is the source of truth, not `disposable[symbolIsDisposed]`
            if (isDisposed) {
                disposable[symbolIsDisposed] = true;
                _logger?.warn('Already disposed %s', debugId(disposable));
                return;
            }
            --activeDisposables;
            disposable[symbolIsDisposed] = isDisposed = true;
            thisArg ? disposeFn.call(thisArg) : disposeFn();
        } catch (err) {
            errors = true;
            throw err;
        } finally {
            --debugDepth;
            _logger?.debug(
                dbgPad() + 'Dispose End   -> %s Active %i%s',
                debugId(disposable),
                activeDisposables,
                errors ? ' ** with errors ** ' : '',
            );
        }
    }
}

function debugId(disposable: DisposableHybrid): string {
    const name = getDisposableName(disposable) || '';
    const ts = getDisposableTs(disposable)?.toFixed(4);
    return name + ' ' + ts;
}

/**
 * Make and object Disposable by adding disposable properties.
 * @param obj - Object to modify
 * @param dispose - the dispose function.
 * @param name - optional debug name
 * @returns the same object.
 */
export function injectDisposable<T extends object>(obj: T, dispose: () => void, name?: string): T & DisposableHybrid {
    return Object.assign(obj, createDisposable(dispose, obj, name));
}

/**
 * Create a Disposable that will dispose the list of disposables.
 * @param disposables - list of Disposables
 * @param name - optional debug name
 * @returns A Disposable
 */
export function createDisposableFromList(disposables: DisposableLike[], name = 'createDisposableFromList'): DisposableHybrid {
    return createDisposable(createDisposeMethodFromList(disposables), undefined, name);
}

/**
 * Create a disposeFn based upon a list of disposables.
 * @param disposables - list of Disposables
 * @param name - optional debug name
 * @returns A dispose function
 */
export function createDisposeMethodFromList(disposables: DisposableLike[], name = ''): () => void {
    let disposed = false;
    const tsId = performance.now().toFixed(4);

    _logger && (name = 'createDisposeMethodFromList ' + (name || '<anonymous>'));

    _logger?.debug(dbgPad() + 'Create: %s %s', name, tsId);

    let errors = 0;

    function dispose() {
        try {
            _logger?.debug(dbgPad() + 'Dispose Start -> %s %s', name, tsId);
            ++debugDepth;
            let error: unknown | undefined = undefined;
            if (disposed) {
                _logger?.warn('Already disposed %s with %o open.', name, disposables.length);
                if (!disposables.length) return;
                // keep going, try to clean up the list if possible.
            }
            disposed = true;

            let disposable: DisposableLike | undefined;

            // Note disposables are disposed in reverse order by default.
            while ((disposable = disposables.pop())) {
                try {
                    disposeOf(disposable);
                } catch (e) {
                    ++errors;
                    error ??= e;
                }
            }

            if (error) {
                _logger && console.error(error);
                throw error;
            }
        } finally {
            --debugDepth;
            _logger?.debug(dbgPad() + 'Dispose End   -> %s %s%s', name, tsId, errors ? ` *** with ${errors} errors ***` : '');
        }
    }
    return dispose;
}

/**
 * Dispose of a disposable.
 * @param disposable - Disposable or function to call.
 * @returns void
 */
export function disposeOf(disposable: DisposableLike | DisposeFn | undefined): void {
    if (!disposable) return;
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

/**
 * Make a disposable into a DisposableHybrid
 * @param disposable - Disposable Like
 * @param name - optional debug name
 * @returns DisposableHybrid
 */
export function makeDisposable(disposable: DisposableLike, name = 'makeDisposable'): DisposableHybrid {
    if (isDisposableHybrid(disposable)) return disposable;
    if (Symbol.dispose in disposable) return createDisposable(disposable[Symbol.dispose], disposable, name);
    if ('dispose' in disposable) return createDisposable(disposable['dispose'], disposable, name);
    return createDisposable(disposable, undefined, name);
}

export function setDisposableName(disposable: DisposableHybrid, name: string | undefined): DisposableHybrid {
    disposable[symbolDisposableName] = name;
    return disposable;
}

export function getDisposableName(disposable: DisposableHybrid): string | undefined {
    return disposable[symbolDisposableName];
}

export function getDisposableTs(disposable: DisposableHybrid): number | undefined {
    return disposable[symbolDisposableTs];
}

export function isDisposed(disposable: DisposableHybrid): boolean | undefined {
    return disposable[symbolIsDisposed];
}

/**
 * Setup logging functions to log creation and disposal events
 * This is primarily used just for debugging.
 * @param logger - logging functions
 */
export function setLogger(logger: Logger | undefined) {
    _logger = logger;
}

export function isDisposableHybrid(disposable: unknown): disposable is DisposableHybrid {
    if (!disposable || typeof disposable !== 'object') return false;
    return symbolIsDisposed in disposable;
}

function dbgPad(): string {
    return ' '.repeat(debugDepth);
}

export type ExcludeDisposableHybrid<T> = Omit<T, keyof DisposableHybrid>;
