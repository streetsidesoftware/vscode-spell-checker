/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DisposableHybrid, DisposableLike } from 'utils-disposables';
import { createDisposable, createDisposeMethodFromList, injectDisposable } from 'utils-disposables';

import type {
    AsyncFunc,
    AsyncFuncVoid,
    Func,
    FuncVoid,
    KeepFieldsOfType,
    MakeMethodsAsync,
    MessageConnection,
    ReturnPromise,
} from './types';

export type ApiPrefix = Record<keyof (ServerSideAPI & ClientSideAPI), string>;

export const defaultApiPrefix: ApiPrefix = {
    serverRequests: 'sr_',
    serverNotifications: 'sn_',
    clientRequests: 'cr_',
    clientNotifications: 'cn_',
} as const;

type CallBack = Func;

export interface Logger {
    log: typeof console.log;
}

export type Requests<T = object> = KeepFieldsOfType<T, Func | AsyncFunc>;

export type Notifications<T = object> = KeepFieldsOfType<T, FuncVoid | AsyncFuncVoid>;

export type ApplyRequestAPI<T> = T & Requests;
export type ApplyNotificationAPI<T> = T & Notifications;

export interface ServerSideAPI {
    /** Requests sent to the Server */
    serverRequests: Requests;
    /** Notifications sent to the Server */
    serverNotifications: Notifications;
}

export interface ClientSideAPI {
    /** Requests sent to the Client */
    clientRequests: object;
    /** Notifications sent to the Client */
    clientNotifications: Notifications;
}

export interface Subscribable<T extends CallBack> {
    subscribe(fn: T): DisposableHybrid;
}

export interface SingleSubscriber<T extends CallBack> {
    subscribe(fn: T | ReturnPromise<T>): DisposableHybrid;
}

export interface PubSub<T extends CallBack> extends Subscribable<T> {
    publish: (...args: Parameters<T>) => Promise<void>;
}

export interface RpcAPI extends ClientSideAPI, ServerSideAPI {}

// type StrictRequired<T> = {
//   [P in keyof T]-?: Exclude<T[P], undefined>;
// };

type ClientRequests<A extends ClientSideAPI> = KeepFieldsOfType<A['clientRequests'], Func>;
type ClientNotifications<A extends ClientSideAPI> = KeepFieldsOfType<A['clientNotifications'], Func>;
type ServerRequests<A extends ServerSideAPI> = KeepFieldsOfType<A['serverRequests'], Func>;
type ServerNotifications<A extends ServerSideAPI> = KeepFieldsOfType<A['serverNotifications'], Func>;

type WrapInSubscribable<A> = {
    [P in keyof A]: A[P] extends CallBack ? Subscribable<A[P]> : never;
};

type WrapInSingleSubscriber<A> = {
    [P in keyof A]: A[P] extends CallBack ? SingleSubscriber<A[P]> : never;
};

type WrapInPubSub<A> = {
    [P in keyof A]: A[P] extends CallBack ? PubSub<A[P]> : never;
};

export type ServerSideMethods<T extends RpcAPI> = {
    clientRequest: MakeMethodsAsync<ClientRequests<T>>;
    clientNotification: MakeMethodsAsync<ClientNotifications<T>>;
    serverRequest: WrapInSingleSubscriber<ServerRequests<T>>;
    serverNotification: WrapInSubscribable<ServerNotifications<T>>;
} & DisposableHybrid;

export type ClientSideMethods<T extends RpcAPI> = {
    clientRequest: WrapInSingleSubscriber<ClientRequests<T>>;
    clientNotification: WrapInSubscribable<ClientNotifications<T>>;
    serverRequest: MakeMethodsAsync<ServerRequests<T>>;
    serverNotification: MakeMethodsAsync<ServerNotifications<T>>;
} & DisposableHybrid;

type DefUseAPI<T> = {
    [P in keyof T]: true;
};

type DefUsePubSubAPI<T> = {
    [P in keyof T]: boolean | T[P] | ReturnPromise<T[P]>;
};

export type ServerAPIDef<T extends RpcAPI> = {
    clientRequests: DefUseAPI<ClientRequests<T>>;
    clientNotifications: DefUseAPI<ClientNotifications<T>>;
    serverRequests: DefUsePubSubAPI<ServerRequests<T>>;
    serverNotifications: DefUsePubSubAPI<ServerNotifications<T>>;
};

export type ClientAPIDef<T extends RpcAPI> = {
    clientRequests: DefUsePubSubAPI<ClientRequests<T>>;
    clientNotifications: DefUsePubSubAPI<ClientNotifications<T>>;
    serverRequests: DefUseAPI<ServerRequests<T>>;
    serverNotifications: DefUseAPI<ServerNotifications<T>>;
};

/**
 * Create an API Interface that can be used on the Server
 * @param connection
 * @param api - the api structure. Provide functions to handle server requests.
 * @returns
 */
export function createServerApi<API extends RpcAPI>(
    connection: MessageConnection,
    api: ServerAPIDef<API>,
    logger?: Logger,
    apiPrefix: ApiPrefix = defaultApiPrefix,
): ServerSideMethods<API> {
    const _disposables: DisposableLike[] = [];

    const serverRequest = mapRequestsToPubSub<ServerRequests<API>>(api.serverRequests, logger);
    const serverNotification = mapNotificationsToPubSub<ServerNotifications<API>>(api.serverNotifications, logger);

    bindRequests(connection, apiPrefix.serverRequests, serverRequest, _disposables, logger);
    bindNotifications(connection, apiPrefix.serverNotifications, serverNotification, _disposables, logger);

    type CR = ClientRequests<API>;
    type CN = ClientNotifications<API>;

    const clientRequest = mapRequestsToFn<CR>(connection, apiPrefix.clientRequests, api.clientRequests, logger);
    const clientNotification = mapNotificationsToFn<CN>(connection, apiPrefix.clientNotifications, api.clientNotifications, logger);

    return injectDisposable(
        {
            clientRequest,
            clientNotification,
            serverRequest,
            serverNotification,
        },
        createDisposeMethodFromList(_disposables),
    );
}

/**
 * Create an API Interface that can be used on the Client
 * @param connection
 * @param api - the api structure. Provide functions to handle client requests.
 * @returns
 */
export function createClientApi<API extends RpcAPI>(
    connection: MessageConnection,
    api: ClientAPIDef<API>,
    logger?: Logger,
    apiPrefix: ApiPrefix = defaultApiPrefix,
): ClientSideMethods<API> {
    const _disposables: DisposableLike[] = [];

    const clientRequest = mapRequestsToPubSub<ClientRequests<API>>(api.clientRequests, logger);
    const clientNotification = mapNotificationsToPubSub<ClientNotifications<API>>(api.clientNotifications, logger);

    bindRequests(connection, apiPrefix.clientRequests, clientRequest, _disposables, logger);
    bindNotifications(connection, apiPrefix.clientNotifications, clientNotification, _disposables, logger);

    type SR = ServerRequests<API>;
    type SN = ServerNotifications<API>;

    const serverRequest = mapRequestsToFn<SR>(connection, apiPrefix.serverRequests, api.serverRequests, logger);
    const serverNotification = mapNotificationsToFn<SN>(connection, apiPrefix.serverNotifications, api.serverNotifications, logger);

    return injectDisposable(
        {
            serverRequest,
            serverNotification,
            clientRequest,
            clientNotification,
        },
        createDisposeMethodFromList(_disposables),
    );
}

function bindRequests<T>(
    connection: MessageConnection,
    prefix: string,
    requests: WrapInPubSub<Requests<T>>,
    disposables: DisposableLike[],
    logger: Logger | undefined,
) {
    for (const [name, pubSub] of Object.entries(requests)) {
        logger?.log('bindRequest %o', { name, fn: typeof pubSub });
        if (!pubSub) continue;
        const pub = pubSub as { publish: Func };
        const methodName = prefix + name;
        disposables.push(
            connection.onRequest(methodName, (p: any[]) => (logger?.log(`handle request "${name}" %o`, p), pub.publish(...p))),
        );
    }
}

function bindNotifications(
    connection: MessageConnection,
    prefix: string,
    requests: WrapInPubSub<Notifications>,
    disposables: DisposableLike[],
    logger: Logger | undefined,
) {
    for (const [name, pubSub] of Object.entries(requests)) {
        logger?.log('bindNotifications %o', { name, fn: typeof pubSub });
        if (!pubSub) continue;
        const methodName = prefix + name;
        const pub = pubSub as { publish: Func };

        disposables.push(
            connection.onNotification(methodName, (p: any[]) => (logger?.log(`handle notification "${name}" %o`, p), pub.publish(...p))),
        );
    }
}

function mapRequestsToFn<T extends Requests>(
    connection: MessageConnection,
    prefix: string,
    requests: DefUseAPI<T>,
    logger: Logger | undefined,
): MakeMethodsAsync<T> {
    let reqSeqNum = 1;
    return Object.fromEntries(
        Object.entries(requests).map(([name]) => {
            const methodName = prefix + name;
            const fn = (...params: any) => {
                const seq = ++reqSeqNum;
                logger?.log(`send request "${name}" %o: Params: %o`, seq, params);
                return connection
                    .sendRequest(methodName, params)
                    .then((value) => (logger?.log(`send request "${name}" %o: Response: %o`, seq, value), value));
            };
            return [name, fn];
        }),
    ) as MakeMethodsAsync<T>;
}

function mapNotificationsToFn<T extends Notifications>(
    connection: MessageConnection,
    prefix: string,
    notifications: DefUseAPI<T>,
    logger: Logger | undefined,
): MakeMethodsAsync<T> {
    return Object.fromEntries(
        Object.entries(notifications).map(([name]) => {
            const methodName = prefix + name;
            const fn = (...params: any) => (
                logger?.log(`send notification "${name}" %o`, params), connection.sendNotification(methodName, params)
            );
            return [name, fn];
        }),
    ) as MakeMethodsAsync<T>;
}

function mapRequestsToPubSub<T extends Requests>(requests: DefUsePubSubAPI<T>, logger: Logger | undefined): WrapInPubSub<T> {
    function mapPubSub([name, fn]: [string, any]): [string, PubSub<CallBack>] | undefined {
        if (!fn) return undefined;
        const pubSub = createPubSingleSubscriber(name, logger);
        if (typeof fn === 'function') {
            pubSub.subscribe(fn);
        }
        return [name, pubSub];
    }

    return Object.fromEntries(Object.entries(requests).map(mapPubSub).filter(isDefined)) as WrapInPubSub<T>;
}

function mapNotificationsToPubSub<T extends Notifications>(notifications: DefUsePubSubAPI<T>, logger: Logger | undefined): WrapInPubSub<T> {
    function mapPubSub([name, fn]: [string, any]): [string, PubSub<CallBack>] | undefined {
        if (!fn) return undefined;
        const pubSub = createPubMultipleSubscribers(name, logger);
        if (typeof fn === 'function') {
            pubSub.subscribe(fn);
        }
        return [name, pubSub];
    }

    return Object.fromEntries(Object.entries(notifications).map(mapPubSub).filter(isDefined)) as WrapInPubSub<T>;
}

function createPubMultipleSubscribers<Subscriber extends ((...args: any) => void) | ((...args: any) => Promise<void>)>(
    name: string,
    logger: Logger | undefined,
): PubSub<Subscriber> {
    const subscribers = new Set<Subscriber>();

    async function publish(..._p: Parameters<Subscriber>) {
        for (const s of subscribers) {
            logger?.log(`notify ${name} %s`, typeof s);
            // eslint-disable-next-line prefer-rest-params
            await s(...arguments);
        }
    }

    function subscribe(s: Subscriber): DisposableHybrid {
        logger?.log(`subscribe to ${name} %s`, typeof s);
        subscribers.add(s);
        return createDisposable(() => subscribers.delete(s));
    }

    return { publish, subscribe };
}

function createPubSingleSubscriber<Subscriber extends (...args: any) => any>(name: string, logger: Logger | undefined): PubSub<Subscriber> {
    let subscriber: Subscriber | undefined = undefined;

    async function listener(..._p: Parameters<Subscriber>) {
        logger?.log(`notify ${name} %o`, subscriber);
        // eslint-disable-next-line prefer-rest-params
        return await subscriber?.(...arguments);
    }

    function subscribe(s: Subscriber): DisposableHybrid {
        subscriber = s;
        logger?.log(`subscribe to ${name} %s`, typeof s);
        return createDisposable(() => {
            if (subscriber === s) {
                subscriber = undefined;
            }
        });
    }

    return { publish: listener, subscribe };
}

function isDefined<T>(v: T | undefined): v is T {
    return !(v === undefined);
}
