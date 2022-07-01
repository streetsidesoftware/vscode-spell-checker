import assert from 'assert';
import type * as vscode from 'vscode';
import { ConfigurationTarget } from './extHostTypes';

export type WorkspaceConfiguration = vscode.WorkspaceConfiguration;

export interface InspectBaseValues<T> {
    defaultValue?: T;
    globalValue?: T;
    workspaceValue?: T;
    workspaceFolderValue?: T;
}

type InspectBaseValueKey = keyof InspectBaseValues<any>;

export interface InspectLanguageValues<T> {
    defaultLanguageValue?: T;
    globalLanguageValue?: T;
    workspaceLanguageValue?: T;
    workspaceFolderLanguageValue?: T;
}

export interface InspectValues<T> extends InspectBaseValues<T>, InspectLanguageValues<T> {}

export interface Inspect<T> extends InspectValues<T> {
    key: string;
    languageIds?: string[];
}

/**
 * Formatted language ID. `[*]` - `[php]`
 */
type LanguageKeyId = string;

type AllLanguagesKeyId = '[*]';
const allLanguagesKeyId: AllLanguagesKeyId = '[*]';

export interface MockWorkspaceConfigurationData<T>
    extends Record<AllLanguagesKeyId, InspectBaseValues<T>>,
        Record<LanguageKeyId, InspectBaseValues<T>> {}

type KeyNames<T> = {
    [key in keyof T]-?: key;
};

// type InspectBaseValuesKey = keyof InspectBaseValues<any>;
// type InspectLanguageValuesKey = keyof InspectLanguageValues<any>;

type InspectBaseValuesKeyNames = KeyNames<InspectBaseValues<any>>;
type InspectLanguageValuesKeyNames = KeyNames<InspectLanguageValues<any>>;

interface InspectKeyMap extends InspectBaseValuesKeyNames, InspectLanguageValuesKeyNames {}

const inspectKeyNames: InspectKeyMap = {
    defaultValue: 'defaultValue',
    globalValue: 'globalValue',
    workspaceValue: 'workspaceValue',
    workspaceFolderValue: 'workspaceFolderValue',
    defaultLanguageValue: 'defaultLanguageValue',
    globalLanguageValue: 'globalLanguageValue',
    workspaceLanguageValue: 'workspaceLanguageValue',
    workspaceFolderLanguageValue: 'workspaceFolderLanguageValue',
} as const;

interface InspectBaseToLanguageKeyNames extends Record<keyof InspectBaseValues<any>, keyof InspectLanguageValues<any>> {
    defaultValue: 'defaultLanguageValue';
    globalValue: 'globalLanguageValue';
    workspaceValue: 'workspaceLanguageValue';
    workspaceFolderValue: 'workspaceFolderLanguageValue';
}

const inspectBaseToLanguageKeyNames: InspectBaseToLanguageKeyNames = {
    defaultValue: 'defaultLanguageValue',
    globalValue: 'globalLanguageValue',
    workspaceValue: 'workspaceLanguageValue',
    workspaceFolderValue: 'workspaceFolderLanguageValue',
};

type InspectKeyNamesTuple = [base: keyof InspectBaseValuesKeyNames, language: keyof InspectLanguageValuesKeyNames];
const keyNamesTuple: InspectKeyNamesTuple[] = (Object.keys(inspectBaseToLanguageKeyNames) as (keyof InspectBaseToLanguageKeyNames)[]).map(
    (k) => [k, inspectBaseToLanguageKeyNames[k]] as InspectKeyNamesTuple
);

type SectionKey = string;
type BaseLanguageSection = ['[*]'] | ['[*]', undefined] | ['[*]', LanguageKeyId];

const mergeInspectOrder = [
    inspectKeyNames.defaultValue,
    inspectKeyNames.defaultLanguageValue,
    inspectKeyNames.globalValue,
    inspectKeyNames.globalLanguageValue,
    inspectKeyNames.workspaceValue,
    inspectKeyNames.workspaceLanguageValue,
    inspectKeyNames.workspaceFolderValue,
    inspectKeyNames.workspaceFolderLanguageValue,
] as const;

type GetFn = <T>(section: string, def?: T) => T | undefined;

export interface MockWorkspaceConfiguration<T> extends WorkspaceConfiguration {
    __inspect_data__: MockWorkspaceConfigurationData<T>;
    __languageId: string | undefined;
    __section: string;
    __getConfiguration: (section: string | undefined, scope?: vscode.ConfigurationScope | null) => MockWorkspaceConfiguration<T>;
}

export function createMockWorkspaceConfiguration<T>(
    data: MockWorkspaceConfigurationData<T> = { [allLanguagesKeyId]: {} },
    key = '',
    scope?: vscode.ConfigurationScope | null
): MockWorkspaceConfiguration<T> {
    const languageIdKey = scopeToLanguageId(scope);
    const bls: BaseLanguageSection = [allLanguagesKeyId, languageIdKey];

    function sectionKey(section: string | undefined): SectionKey {
        return joinPath(key, section);
    }

    const cfg: MockWorkspaceConfiguration<T> = {
        get: jest.fn((section, defaultValue) => getValueFromInspect(data, bls, sectionKey(section)) ?? defaultValue) as GetFn,
        has: jest.fn((section) => getValueFromInspect(data, bls, sectionKey(section)) !== undefined),
        inspect: jest.fn((section) => getInspectForPath(data, bls, sectionKey(section))),
        update: jest.fn((section, ...args) => pVoid(updateInspect(data, bls, sectionKey(section), ...args))),
        __inspect_data__: data,
        __section: key,
        __languageId: languageIdKey,
        __getConfiguration: (section: string | undefined, scope?: vscode.ConfigurationScope | null) =>
            createMockWorkspaceConfiguration(data, section, scope),
    };

    return cfg;
}

function joinPath(a: string, b: string | undefined): string {
    const search = !a ? b : b ? a + '.' + b : a;
    return search || '';
}

function pVoid<T>(t: T): Promise<void> {
    return Promise.resolve(t).then(() => {});
}

function getInspectForPath<T, U>(
    configData: MockWorkspaceConfigurationData<T>,
    bls: BaseLanguageSection,
    path: string
): Inspect<U> | undefined {
    const r: Inspect<U> = {
        key: path,
    };

    let found = false;

    const [base, lang] = bls;
    for (const [key] of keyNamesTuple) {
        const v = getKeyValue(configData, base, key, path);
        r[key] = v;
        found = found || v !== undefined;
    }

    if (lang) {
        for (const [srcKey, dstKey] of keyNamesTuple) {
            const v = getKeyValue(configData, lang, srcKey, path);
            r[dstKey] = v;
            found = found || v !== undefined;
        }
    }

    return found ? r : undefined;
}

function getKeyValue<T>(
    configData: MockWorkspaceConfigurationData<T>,
    language: keyof MockWorkspaceConfigurationData<T>,
    inspectKey: InspectBaseValueKey,
    path: string
): any | undefined {
    return getKeyValueFromRecord(configData[language]?.[inspectKey], path);
}

function getKeyValueFromRecord(data: Record<string, any> | undefined, key: string): any | undefined {
    const parts = key.split('.');
    for (const k of parts) {
        if (data === undefined) return undefined;
        data = data[k];
    }
    return data;
}

function getValueFromInspect<T, U>(configData: MockWorkspaceConfigurationData<T>, bls: BaseLanguageSection, path: string): U | undefined {
    const d = getInspectForPath<T, U>(configData, bls, path);
    return d && mergeInspect(d);
}

function mergeInspect<T>(inspect: Inspect<T>): T | undefined {
    let r: T | undefined;
    for (const key of mergeInspectOrder) {
        const v = inspect[key];
        if (v === undefined) continue;
        if (r === undefined || typeof r !== 'object' || typeof v !== 'object' || Array.isArray(r) || Array.isArray(v)) {
            r = v;
            continue;
        }
        r = Object.assign({}, r, v);
    }
    return r;
}

function setKeyValue(data: Record<string, any>, section: string, value: any): any {
    function r(data: Record<string, any>, path: string[]): any {
        if (!path.length) return value;
        const head = path[0];
        assert(head !== '__proto__');
        data[head] = r(data[head] || Object.create(null), path.slice(1));
        return data;
    }

    r(data, section.split('.'));
    return data;
}

function updateInspect<T>(
    data: MockWorkspaceConfigurationData<T>,
    bls: BaseLanguageSection,
    section: string,
    value: any,
    configurationTarget?: ConfigurationTarget | boolean | null,
    overrideInLanguage?: boolean
): void {
    const inspectKey = fieldToUpdate(bls, configurationTarget, overrideInLanguage);
    setKeyValue(data, joinPath(inspectKey, section), value);
}

function normalizeConfigurationTarget(t?: ConfigurationTarget | boolean | null): ConfigurationTarget {
    if (t === true) return ConfigurationTarget.Global;
    if (t === false) return ConfigurationTarget.Workspace;
    if (t === undefined) return ConfigurationTarget.WorkspaceFolder;
    if (t === null) return ConfigurationTarget.WorkspaceFolder;
    return t;
}

const fieldToUpdateMap = {
    [ConfigurationTarget.Global]: inspectKeyNames.globalValue,
    [ConfigurationTarget.Workspace]: inspectKeyNames.workspaceValue,
    [ConfigurationTarget.WorkspaceFolder]: inspectKeyNames.workspaceFolderValue,
} as const;

function fieldToUpdate(
    bls: BaseLanguageSection,
    configurationTarget?: ConfigurationTarget | boolean | null,
    overrideInLanguage?: boolean
): string {
    const [base, lang] = bls;
    const root = overrideInLanguage && lang ? lang : base;
    const target = normalizeConfigurationTarget(configurationTarget);
    return root + '.' + fieldToUpdateMap[target];
}

interface WithLanguageId {
    languageId?: string;
}

function scopeToLanguageId(scope?: vscode.ConfigurationScope | null): LanguageKeyId | undefined {
    if (!scope) return undefined;
    if ((<WithLanguageId>scope).languageId) return `[${(<WithLanguageId>scope).languageId}]`;
    return undefined;
}
