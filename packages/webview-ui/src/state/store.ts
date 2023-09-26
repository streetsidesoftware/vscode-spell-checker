import { createDisposeMethodFromList, type DisposableLike } from 'utils-disposables';
import type { WatchFields } from 'webview-api';

/* eslint-disable @typescript-eslint/no-explicit-any */
type DisposableFn = () => void;

export type Subscriber<T> = (v: T) => any;

type SetMethod<T> = (v: T) => void;
export type UpdateFn<T> = (v: T | undefined) => T;
type UpdateMethod<T> = (u: UpdateFn<T>) => void;
export type SubscribeFn<T> = (s: Subscriber<T>) => DisposableFn;

export interface ReadonlyStore<T> extends Subscribable<T> {}

export interface Store<T> extends ReadonlyStore<T> {
    set: SetMethod<T>;
    update: UpdateMethod<T>;
}

export interface ValueStore<T> extends Store<T> {
    readonly value: Promise<T>;
}

/**
 * A ClientServerStore is used to avoid feedback loops.
 */
export interface ClientServerStore<T, N> {
    /** Name of the store */
    readonly name: N;
    readonly client: Store<T>;
    readonly server: Store<T>;

    /** Dispose of any resources */
    dispose(): void;
}

const symbolNotSet = Symbol('no set');
type SymbolNotSet = typeof symbolNotSet;

class StoreObservable<T> implements Store<T> {
    protected _value: T | SymbolNotSet;
    private pubSub = createPubSub<T>();
    constructor(value?: T) {
        this._value = value === undefined ? symbolNotSet : value;
    }

    set(value: T) {
        // Do not update if the value has not changed.
        if (!isNotEqual(this._value, value)) return;
        this._value = value;
        this.pubSub.notify(this._value);
        return;
    }

    subscribe(s: Subscriber<T>): DisposableFn {
        const disposableFn = this.pubSub.subscribe(s);
        this._value !== symbolNotSet && s(this._value);
        return disposableFn;
    }

    update(u: UpdateFn<T>) {
        return this.set(u(this._value !== symbolNotSet ? this._value : undefined));
    }
}

class ValueStoreObservable<T> extends StoreObservable<T> implements ValueStore<T> {
    constructor(value: T) {
        super(value);
    }

    get value() {
        return this._value !== symbolNotSet ? Promise.resolve(this._value) : awaitForSubscribable(this);
    }
}

export interface ReadonlyClientServerStoreOptions<T, N> {
    /** Name of this store */
    name: N;
    initialValue: T;
    query?: () => Promise<T>;
    watch?: Subscribable<void>;
}

export interface ClientServerStoreOptions<T, N> extends ReadonlyClientServerStoreOptions<T, N> {
    mutate?: (value: T, set: SetMethod<T>, update: UpdateMethod<T>) => Promise<void>;
}

class ClientServerStoreImpl<T, N> implements ClientServerStore<T, N> {
    readonly name: N;
    private _value: T | SymbolNotSet;
    private _busy = false;
    private subServer = new Set<Subscriber<T>>();
    private subClient = new Set<Subscriber<T>>();
    private disposables: DisposableLike[] = [];
    private mutate: (value: T, set: SetMethod<T>, update: UpdateMethod<T>) => Promise<void> = () => Promise.resolve();
    readonly dispose: () => void;

    readonly client: Store<T>;
    readonly server: Store<T>;

    get value() {
        return this._value;
    }

    constructor(readonly options: ClientServerStoreOptions<T, N>) {
        this.name = options.name;
        this._value = options.initialValue;

        const getValue = () => (this._value === symbolNotSet ? undefined : this._value);

        // We need to notify the sever of any changes made by any client.
        this.client = {
            set: (v: T) => this.setValue(v, true),
            update: (uFn) => this.setValue(uFn(getValue()), true),
            subscribe: (s) => this.subscribe(this.subClient, s, true),
        };
        // We do not want to notify the server of changes made by the server.
        this.server = {
            set: (v: T) => this.setValue(v, false),
            update: (uFn) => this.setValue(uFn(getValue()), false),
            subscribe: (s) => this.subscribe(this.subServer, s, false),
        };

        this.mutate = options.mutate || this.mutate;

        this.disposables.push(this.server.subscribe((v) => this._mutate(v)));

        options.watch && this.disposables.push(options.watch.subscribe(() => this._query()));

        this.dispose = createDisposeMethodFromList(this.disposables);
        this._query();
    }

    private setValue(value: T, notifyServer: boolean) {
        if (!isNotEqual(this._value, value)) return;

        this._value = value;
        if (notifyServer) this.notify(this.subServer);
        this.notify(this.subClient);
    }

    private notify(subscriptions: Set<Subscriber<T>>) {
        if (this._busy) return;
        if (this._value === symbolNotSet) return;
        try {
            this._busy = true;
            for (const s of subscriptions) {
                s(this._value);
            }
        } finally {
            this._busy = false;
        }
    }

    private subscribe(subscriptions: Set<Subscriber<T>>, subscriber: Subscriber<T>, notify: boolean): DisposableFn {
        subscriptions.add(subscriber);
        notify && this._value !== symbolNotSet && subscriber(this._value);
        return () => subscriptions.delete(subscriber);
    }

    /**
     * A client has made a change to the value, send the mutation to the server.
     * @param v - the changed value.
     */
    private _mutate(v: T) {
        const handle = async () => {
            try {
                await this.mutate(v, this.server.set, this.server.update);
            } catch (e) {
                console.error(e);
            }
        };
        handle();
    }

    /**
     * Query the server for the value.
     * @returns void
     */
    private _query() {
        console.log('query for %s', this.name);
        const query = this.options.query;
        if (!query) return;
        const handle = async () => {
            try {
                const value = await query();
                console.log('query got %o', value);
                this.server.set(value);
            } catch (e) {
                console.error(e);
            }
        };
        handle();
    }
}

/**
 * A ReadonlyClientServerStore is used to avoid feedback loops.
 */
export interface ReadonlyClientServerStore<T, N> {
    /** Name of the store */
    readonly name: N;
    readonly client: ReadonlyStore<T>;
    readonly server: Store<T>;

    /** Dispose of any resources */
    dispose(): void;
}

class ReadonlyClientServerStoreImpl<T, N> implements ReadonlyClientServerStore<T, N> {
    readonly name: N;
    private _value: T | SymbolNotSet;
    private _busy = false;
    private subServer = new Set<Subscriber<T>>();
    private subClient = new Set<Subscriber<T>>();
    private disposables: DisposableLike[] = [];
    readonly dispose: () => void;

    readonly client: ReadonlyStore<T>;
    readonly server: Store<T>;

    constructor(readonly options: ReadonlyClientServerStoreOptions<T, N>) {
        this.name = options.name;
        this._value = options.initialValue;

        // We need to notify the sever of any changes made by any client.
        this.client = {
            subscribe: (s) => this.subscribe(this.subClient, s, true),
        };
        // We do not want to notify the server of changes made by the server.
        this.server = {
            set: (v: T) => this.setValue(v, false),
            update: (uFn) => this.setValue(uFn(this._value === symbolNotSet ? undefined : this._value), false),
            subscribe: (s) => this.subscribe(this.subServer, s, false),
        };

        options.watch && this.disposables.push(options.watch.subscribe(() => this._query()));

        this.dispose = createDisposeMethodFromList(this.disposables);
        this._query();
    }

    private setValue(value: T, notifyServer: boolean) {
        if (!isNotEqual(this._value, value)) return;

        this._value = value;
        if (notifyServer) this.notify(this.subServer);
        this.notify(this.subClient);
    }

    private notify(subscriptions: Set<Subscriber<T>>) {
        if (this._busy) return;
        if (this._value === symbolNotSet) return;
        try {
            this._busy = true;
            for (const s of subscriptions) {
                s(this._value);
            }
        } finally {
            this._busy = false;
        }
    }

    private subscribe(subscriptions: Set<Subscriber<T>>, subscriber: Subscriber<T>, notify: boolean): DisposableFn {
        subscriptions.add(subscriber);
        notify && this._value !== symbolNotSet && subscriber(this._value);
        return () => subscriptions.delete(subscriber);
    }

    /**
     * Query the server for the value.
     * @returns void
     */
    private _query() {
        const query = this.options.query;
        if (!query) return;
        const handle = async () => {
            try {
                const value = await query();
                this.server.set(value);
            } catch (e) {
                console.error(e);
            }
        };
        handle();
    }
}

function isNotEqual<T>(a: T, b: T): boolean {
    return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

export function writable<T>(v: T): ValueStore<T>;
export function writable<T>(v?: T | undefined): ValueStore<T | undefined>;
export function writable<T>(v: T): ValueStore<T> {
    return new ValueStoreObservable(v);
}
export function createClientServerStore<T, N extends WatchFields>(options: ClientServerStoreOptions<T, N>): ClientServerStore<T, N> {
    return new ClientServerStoreImpl(options);
}

export function createReadonlyClientServerStore<T, N extends WatchFields>(
    options: ClientServerStoreOptions<T, N>,
): ReadonlyClientServerStore<T, N> {
    return new ReadonlyClientServerStoreImpl<T, N>(options);
}

export interface Subscribable<T> {
    subscribe(s: Subscriber<T>): DisposableFn;
}

interface PubSub<T> extends Subscribable<T> {
    notify(v: T): void;
}

function createPubSub<T>(): PubSub<T> {
    const subscriptions = new Set<Subscriber<T>>();
    let busy = false;

    function notify(value: T) {
        if (busy) return;
        try {
            busy = true;
            for (const s of subscriptions) {
                s(value);
            }
        } finally {
            busy = false;
        }
    }

    function subscribe(s: (v: T) => any): DisposableFn {
        subscriptions.add(s);
        return () => subscriptions.delete(s);
    }

    return {
        notify,
        subscribe,
    };
}

export function mapSubscribable<T, U>(subscribable: Subscribable<T>, mapFn: (v: T, subscriber: Subscriber<U>) => U): Subscribable<U> {
    function subscribe(s: (v: U) => any): DisposableFn {
        return subscribable.subscribe((t) => mapFn(t, s));
    }

    return { subscribe };
}

export function awaitForSubscribable<T>(sub: Subscribable<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        let disposable: DisposableFn | undefined;
        try {
            disposable = sub.subscribe(resolve);
        } catch (e) {
            reject(e);
        } finally {
            disposable?.();
        }
    });
}
