import { ExtensionContext } from 'vscode';
import { CSpellClient } from './client';
import { DictionaryHelper } from './settings/DictionaryHelper';


export interface GlobalDependencies {
    name: string;
    extensionContext: ExtensionContext;
    client: CSpellClient;
    dictionaryHelper: DictionaryHelper;
}

type KeysForGlobalDependencies = {
    [K in keyof GlobalDependencies]: undefined;
}

const keys: KeysForGlobalDependencies = {
    name: undefined,
    extensionContext: undefined,
    client: undefined,
    dictionaryHelper: undefined,
};

const globals: GlobalDependencies = {} as GlobalDependencies;
export const dependencies: Readonly<GlobalDependencies> = globals;

export function register<K extends keyof GlobalDependencies>(key: K, fn: () => GlobalDependencies[K]) {
    Object.defineProperty(globals, key, {
        get: function() {
            const value = fn();
            Object.defineProperty(this, key, {
                value,
            })
            return value;
        }
    });
}

export function get<K extends keyof GlobalDependencies>(key: K): GlobalDependencies[K] {
    if (Object.getOwnPropertyDescriptor(globals, key) === undefined) {
        throw new Error(`Missing Dependency Resolver: '${key}'`);
    }
    return globals[key];
}

export function set<K extends keyof GlobalDependencies>(key: K, value: GlobalDependencies[K]) {
    Object.defineProperty(globals, key, {
        value,
        configurable: true,
        enumerable: true,
    });
}

function setDefaultGetter<K extends keyof GlobalDependencies>(key: K) {
    Object.defineProperty(globals, key, {
        get: function() {
            throw new Error(`Missing Dependency: ${key}`);
        },
        configurable: true,
        enumerable: true,
    });
}

export function init() {
    Object.keys(keys).forEach(setDefaultGetter);
}

init();
