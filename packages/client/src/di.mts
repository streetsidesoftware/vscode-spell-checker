import type { ExtensionContext } from 'vscode';

import type { CSpellClient } from './client/index.mjs';
import type { IssueTracker } from './issueTracker.mjs';
import type { DictionaryHelper } from './settings/DictionaryHelper.mjs';
import type { EventLogger } from './storage/index.mjs';

export interface GlobalDependencies {
    name: string;
    extensionContext: ExtensionContext;
    client: CSpellClient;
    issueTracker: IssueTracker;
    dictionaryHelper: DictionaryHelper;
    eventLogger: EventLogger;
}

type KeysForGlobalDependencies = Record<GlobalDependenciesKeys, undefined>;

const definedDependencyKeys: KeysForGlobalDependencies = {
    name: undefined,
    extensionContext: undefined,
    client: undefined,
    dictionaryHelper: undefined,
    issueTracker: undefined,
    eventLogger: undefined,
};

type GlobalDependenciesKeys = keyof GlobalDependencies;
const keys: GlobalDependenciesKeys[] = Object.keys(definedDependencyKeys) as GlobalDependenciesKeys[];

const globals: GlobalDependencies = {} as GlobalDependencies;

export function getDependencies(): GlobalDependencies {
    return globals;
}

export function register<K extends keyof GlobalDependencies>(key: K, fn: () => GlobalDependencies[K]): void {
    Object.defineProperty(globals, key, {
        get: function () {
            const value = fn();
            Object.defineProperty(this, key, {
                value,
            });
            return value;
        },
    });
}

export function get<K extends keyof GlobalDependencies>(key: K): GlobalDependencies[K] {
    if (Object.getOwnPropertyDescriptor(globals, key) === undefined) {
        throw new Error(`Missing Dependency Resolver: '${key}'`);
    }
    return globals[key];
}

export function getClient(): CSpellClient {
    return get('client');
}

export function getExtensionContext(): ExtensionContext {
    return get('extensionContext');
}

export function getIssueTracker(): IssueTracker {
    return get('issueTracker');
}

export function getEventLogger(): EventLogger {
    return get('eventLogger');
}

export function set<K extends keyof GlobalDependencies>(key: K, value: GlobalDependencies[K]): void {
    Object.defineProperty(globals, key, {
        value,
        configurable: true,
        enumerable: true,
    });
}

function setDefaultGetter<K extends keyof GlobalDependencies>(key: K) {
    Object.defineProperty(globals, key, {
        get: function () {
            throw new Error(`Missing Dependency: ${key}`);
        },
        configurable: true,
        enumerable: true,
    });
}

function init(): void {
    keys.forEach(setDefaultGetter);
}

init();

export const __testing__ = {
    init,
};
