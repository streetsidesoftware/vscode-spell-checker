/* eslint-disable @typescript-eslint/no-explicit-any */
type DisposableFn = () => void;

export type Subscriber<T> = (v: T) => any;

type SetMethod<T> = (v: T) => void;
export type UpdateFn<T> = (v: T) => T;
type UpdateMethod<T> = (u: UpdateFn<T>) => void;
export type SubscribeFn<T> = (s: Subscriber<T>) => DisposableFn;

export interface Store<T> {
    set: SetMethod<T>;
    update: UpdateMethod<T>;
    subscribe: SubscribeFn<T>;
}

export interface ValueStore<T> extends Store<T> {
    readonly value: T;
}

/**
 * A ClientServerStore is used to avoid feedback loops.
 */
export interface ClientServerStore<T> {
    readonly value: T;
    readonly client: ValueStore<T>;
    /** Notify the */
    readonly server: ValueStore<T>;
}

class StoreObservable<T> implements Store<T> {
    protected _value: T;
    private pubSub = createPubSub<T>();
    constructor(value: T) {
        this._value = value;
    }

    set(value: T) {
        // Do not update if the value has not changed.
        if (!isNotEqual(this._value, value)) return;
        this._value = value;
        this.pubSub.notify(this._value);
        return;
    }

    subscribe(s: (v: T) => any): DisposableFn {
        const disposableFn = this.pubSub.subscribe(s);
        s(this._value);
        return disposableFn;
    }

    update(u: (v: T) => T) {
        return this.set(u(this._value));
    }
}

class ValueStoreObservable<T> extends StoreObservable<T> implements ValueStore<T> {
    constructor(value: T) {
        super(value);
    }

    get value() {
        return this._value;
    }
}

class ClientServerStoreImpl<T> implements ClientServerStore<T> {
    private _value: T;
    private _busy = false;
    private subServer = new Set<Subscriber<T>>();
    private subClient = new Set<Subscriber<T>>();

    readonly client: ValueStore<T>;
    readonly server: ValueStore<T>;

    get value() {
        return this._value;
    }

    constructor(value: T) {
        this._value = value;

        const getValue = () => this._value;

        // We need to notify the sever of any changes made by any client.
        this.client = {
            get value() {
                return getValue();
            },
            set: (v: T) => this.setValue(v, true),
            update: (uFn) => this.setValue(uFn(this._value), true),
            subscribe: (s) => this.subscribe(this.subClient, s, true),
        };
        // We do not want to notify the server of changes made by the server.
        this.server = {
            get value() {
                return getValue();
            },
            set: (v: T) => this.setValue(v, false),
            update: (uFn) => this.setValue(uFn(this._value), false),
            subscribe: (s) => this.subscribe(this.subServer, s, false),
        };
    }

    private setValue(value: T, notifyServer: boolean) {
        if (!isNotEqual(this._value, value)) return;

        this._value = value;
        if (notifyServer) this.notify(this.subServer);
        this.notify(this.subClient);
    }

    private notify(subscriptions: Set<Subscriber<T>>) {
        if (this._busy) return;
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
        notify && subscriber(this._value);
        return () => subscriptions.delete(subscriber);
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
export function createClientServerStore<T>(initialValue: T): ClientServerStore<T>;
export function createClientServerStore<T>(initialValue?: T | undefined): ClientServerStore<T | undefined>;
export function createClientServerStore<T>(initialValue: T): ClientServerStore<T> {
    return new ClientServerStoreImpl(initialValue);
}

interface Subscribable<T> {
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

/**
 * Create a store based upon a field in another store.
 * @param store - the store containing the field.
 * @param field - the field to monitor
 * @returns A writeable store, that will update and be updated by store[field]
 */
export function shadowStore<T, K extends keyof T>(store: Store<T>, field: K): Store<T[K]> {
    type U = T[K];

    return derivativeRWPassThrough<T, U>(
        store,
        ($t) => $t[field],
        ($u, $t) => (($t[field] = $u), $t),
    );
}

/**
 * Create a writeable store that will transform a value from another store.
 * This store does not keep any values, it just transforms it for each subscriber.
 * @param store - store to base the value on
 * @param reader - method to covert the sorted value to the derivative value.
 * @param writer - method to write back the value.
 * @returns a writeable store
 */
export function derivativeRWPassThrough<T, U>(store: Store<T>, reader: ($t: T) => U, writer: ($u: U, $t: T) => T): Store<U> {
    function set(u: U) {
        store.update((t) => writer(u, t));
    }

    function subscribe(s: (v: U) => any): DisposableFn {
        return store.subscribe((t) => s(reader(t)));
    }

    function update(fn: (u: U) => U) {
        store.update((t) => writer(fn(reader(t)), t));
    }

    return { set, subscribe, update };
}
