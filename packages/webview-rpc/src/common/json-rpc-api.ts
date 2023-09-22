/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDisposable, createDisposeMethodFromList, type Disposable, injectDisposable } from 'create-disposable';
import { type MessageConnection, NotificationType, RequestType } from 'vscode-jsonrpc/lib/common/api';

import { log } from './logger';
import type { AsyncFunc, AsyncFuncVoid, Func, FuncVoid, KeepFieldsOfType, MakeMethodsAsync, ReturnPromise } from './types';

export const apiPrefix = {
    serverRequest: 'sr_',
    serverNotification: 'sn_',
    clientRequest: 'cr_',
    clientNotification: 'cn_',
} as const;

type CallBack = Func;

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
    subscribe(fn: T): Disposable;
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

type WrapInPubSub<A> = {
    [P in keyof A]: A[P] extends CallBack ? PubSub<A[P]> : never;
};

export type ServerSideMethods<T extends RpcAPI> = {
    clientRequest: MakeMethodsAsync<ClientRequests<T>>;
    clientNotification: MakeMethodsAsync<ClientNotifications<T>>;
    serverRequest: WrapInSubscribable<ServerRequests<T>>;
    serverNotification: WrapInSubscribable<ServerNotifications<T>>;
} & Disposable;

export type ClientSideMethods<T extends RpcAPI> = {
    clientRequest: WrapInSubscribable<ClientRequests<T>>;
    clientNotification: WrapInSubscribable<ClientNotifications<T>>;
    serverRequest: MakeMethodsAsync<ServerRequests<T>>;
    serverNotification: MakeMethodsAsync<ServerNotifications<T>>;
} & Disposable;

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
export function createServerApi<API extends RpcAPI>(connection: MessageConnection, api: ServerAPIDef<API>): ServerSideMethods<API> {
    const _disposables: Disposable[] = [];

    const serverRequest = mapRequestsToPubSub<ServerRequests<API>>(api.serverRequests);
    const serverNotification = mapNotificationsToPubSub<ServerNotifications<API>>(api.serverNotifications);

    bindRequests(connection, apiPrefix.serverRequest, serverRequest, _disposables);
    bindNotifications(connection, apiPrefix.serverNotification, serverNotification, _disposables);

    type CR = ClientRequests<API>;
    type CN = ClientNotifications<API>;

    const clientRequest = mapRequestsToFn<CR>(connection, apiPrefix.clientRequest, api.clientRequests);
    const clientNotification = mapNotificationsToFn<CN>(connection, apiPrefix.clientNotification, api.clientNotifications);

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
export function createClientApi<API extends RpcAPI>(connection: MessageConnection, api: ClientAPIDef<API>): ClientSideMethods<API> {
    const _disposables: Disposable[] = [];

    const clientRequest = mapRequestsToPubSub<ClientRequests<API>>(api.clientRequests);
    const clientNotification = mapNotificationsToPubSub<ClientNotifications<API>>(api.clientNotifications);

    bindRequests(connection, apiPrefix.clientRequest, clientRequest, _disposables);
    bindNotifications(connection, apiPrefix.clientNotification, clientNotification, _disposables);

    type SR = ServerRequests<API>;
    type SN = ServerNotifications<API>;

    const serverRequest = mapRequestsToFn<SR>(connection, apiPrefix.serverRequest, api.serverRequests);
    const serverNotification = mapNotificationsToFn<SN>(connection, apiPrefix.serverNotification, api.serverNotifications);

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

function bindRequests<T>(connection: MessageConnection, prefix: string, requests: WrapInPubSub<Requests<T>>, disposables: Disposable[]) {
    for (const [name, pubSub] of Object.entries(requests)) {
        log('bindRequest %o', { name, fn: typeof pubSub });
        if (!pubSub) continue;
        const pub = pubSub as { publish: Func };
        const tReq = new RequestType<any[], Promise<any>, unknown>(prefix + name);
        disposables.push(connection.onRequest(tReq, (p: any[]) => (log(`handle request "${name}" %o`, p), pub.publish(...p))));
    }
}

function bindNotifications(
    connection: MessageConnection,
    prefix: string,
    requests: WrapInPubSub<Notifications>,
    disposables: Disposable[],
) {
    for (const [name, pubSub] of Object.entries(requests)) {
        log('bindNotifications %o', { name, fn: typeof pubSub });
        if (!pubSub) continue;
        const tNote = new NotificationType<any[]>(prefix + name);
        const pub = pubSub as { publish: Func };

        disposables.push(connection.onNotification(tNote, (p: any[]) => (log(`handle notification "${name}" %o`, p), pub.publish(...p))));
    }
}

function mapRequestsToFn<T extends Requests>(connection: MessageConnection, prefix: string, requests: DefUseAPI<T>): MakeMethodsAsync<T> {
    return Object.fromEntries(
        Object.entries(requests).map(([name]) => {
            const tReq = new RequestType(prefix + name);
            const fn = (...params: any) => (log(`send request "${name}" %o`, params), connection.sendRequest(tReq, params));
            return [name, fn];
        }),
    ) as MakeMethodsAsync<T>;
}

function mapNotificationsToFn<T extends Notifications>(
    connection: MessageConnection,
    prefix: string,
    notifications: DefUseAPI<T>,
): MakeMethodsAsync<T> {
    return Object.fromEntries(
        Object.entries(notifications).map(([name]) => {
            const tNote = new NotificationType(prefix + name);
            const fn = (...params: any) => (log(`send request "${name}" %o`, params), connection.sendNotification(tNote, params));
            return [name, fn];
        }),
    ) as MakeMethodsAsync<T>;
}

function mapRequestsToPubSub<T extends Requests>(requests: DefUsePubSubAPI<T>): WrapInPubSub<T> {
    function mapPubSub([name, fn]: [string, any]): [string, PubSub<CallBack>] | undefined {
        if (!fn) return undefined;
        const pubSub = createPubSingleSubscriber(name);
        if (typeof fn === 'function') {
            pubSub.subscribe(fn);
        }
        return [name, pubSub];
    }

    return Object.fromEntries(Object.entries(requests).map(mapPubSub).filter(isDefined)) as WrapInPubSub<T>;
}

function mapNotificationsToPubSub<T extends Notifications>(notifications: DefUsePubSubAPI<T>): WrapInPubSub<T> {
    function mapPubSub([name, fn]: [string, any]): [string, PubSub<CallBack>] | undefined {
        if (!fn) return undefined;
        const pubSub = createPubMultipleSubscribers(name);
        if (typeof fn === 'function') {
            pubSub.subscribe(fn);
        }
        return [name, pubSub];
    }

    return Object.fromEntries(Object.entries(notifications).map(mapPubSub).filter(isDefined)) as WrapInPubSub<T>;
}

function createPubMultipleSubscribers<Subscriber extends ((...args: any) => void) | ((...args: any) => Promise<void>)>(
    name: string,
): PubSub<Subscriber> {
    const subscribers = new Set<Subscriber>();

    async function publish(..._p: Parameters<Subscriber>) {
        for (const s of subscribers) {
            log(`notify ${name} %o`, s);
            // eslint-disable-next-line prefer-rest-params
            await s(...arguments);
        }
    }

    function subscribe(s: Subscriber): Disposable {
        log(`subscribe to ${name} %o`, s);
        subscribers.add(s);
        return createDisposable(() => subscribers.delete(s));
    }

    return { publish, subscribe };
}

function createPubSingleSubscriber<Subscriber extends (...args: any) => any>(name: string): PubSub<Subscriber> {
    let subscriber: Subscriber | undefined = undefined;

    async function listener(..._p: Parameters<Subscriber>) {
        log(`notify ${name} %o`, subscriber);
        // eslint-disable-next-line prefer-rest-params
        return await subscriber?.(...arguments);
    }

    function subscribe(s: Subscriber): Disposable {
        subscriber = s;
        log(`subscribe to ${name} %o`, s);
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
