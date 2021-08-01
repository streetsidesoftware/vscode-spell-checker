/**
 * This helper is to help with matching possible configuration targets to configuration fields.
 */

import { toUri, uriToName } from 'common-utils/uriHelper.js';
import * as vscode from 'vscode';
import type {
    ClientConfigKind,
    ClientConfigScope,
    ClientConfigTarget,
    ClientConfigTargetCSpell,
    ClientConfigTargetDictionary,
    ClientConfigTargetVSCode,
} from './clientConfigTarget';
import { configurationTargetToDictionaryScope } from './targetAndScope';

type ConfigKindMask = {
    [key in ClientConfigKind]: boolean;
};

type ConfigScopeMask = {
    [key in ClientConfigScope]: boolean;
};

export interface ConfigTargetMatchPattern {
    kind: ConfigKindMask;
    scope: ConfigScopeMask;
}

export const matchKindNone: ConfigKindMask = { dictionary: false, cspell: false, vscode: false };
export const matchKindAll: ConfigKindMask = { dictionary: true, cspell: true, vscode: true };
export const matchKindConfig: ConfigKindMask = { dictionary: false, cspell: true, vscode: true };
export const matchKindCSpell: ConfigKindMask = { dictionary: false, cspell: true, vscode: false };
export const matchKindVSCode: ConfigKindMask = { dictionary: false, cspell: false, vscode: true };
export const matchKindDictionary: ConfigKindMask = { dictionary: true, cspell: false, vscode: false };

export const matchScopeNone: ConfigScopeMask = { unknown: false, folder: false, workspace: false, user: false };
export const matchScopeAll: ConfigScopeMask = { unknown: true, folder: true, workspace: true, user: true };
export const matchScopeAllButUser: ConfigScopeMask = { unknown: true, folder: true, workspace: true, user: false };
export const matchScopeUser: ConfigScopeMask = { unknown: false, folder: false, workspace: false, user: true };
export const matchScopeWorkspace: ConfigScopeMask = { unknown: false, folder: false, workspace: true, user: false };
export const matchScopeFolder: ConfigScopeMask = { unknown: false, folder: true, workspace: false, user: false };

export type TargetBestMatchSyncFn = (configTargets: ClientConfigTarget[]) => ClientConfigTarget | undefined;

export type TargetBestMatchAsyncFn = (
    configTargets: ClientConfigTarget[]
) => Promise<ClientConfigTarget | undefined> | ClientConfigTarget | undefined;

export type TargetBestMatchFn = TargetBestMatchSyncFn | TargetBestMatchAsyncFn;

export type TargetMatchFn = (target: ClientConfigTarget) => boolean;

const KindKeys = Object.freeze(Object.keys(matchKindAll) as (keyof ConfigKindMask)[]);
const ScopeKeys = Object.freeze(Object.keys(matchScopeAll) as (keyof ConfigScopeMask)[]);

export const dictionaryTargetBestMatch = _buildQuickPickBestMatchTargetFn(matchKindAll, matchScopeAllButUser);
export const dictionaryTargetBestMatchUser = _buildQuickPickBestMatchTargetFn(matchKindAll, matchScopeUser);
export const dictionaryTargetBestMatchWorkspace = _buildQuickPickBestMatchTargetFn(matchKindAll, matchScopeWorkspace);
export const dictionaryTargetBestMatchFolder = _buildQuickPickBestMatchTargetFn(matchKindAll, matchScopeFolder);
export const dictionaryTargetCSpell = _buildQuickPickBestMatchTargetFn(matchKindCSpell, matchScopeAll);
export const dictionaryTargetVSCodeUser = _buildQuickPickBestMatchTargetFn(matchKindVSCode, matchScopeUser);
export const dictionaryTargetVSCodeWorkspace = _buildQuickPickBestMatchTargetFn(matchKindVSCode, matchScopeWorkspace);
export const dictionaryTargetVSCodeFolder = _buildQuickPickBestMatchTargetFn(matchKindVSCode, matchScopeFolder);

export const patternMatchNoDictionaries = createConfigTargetMatchPattern(negateKind(matchKindDictionary), matchScopeAll);
export const patternMatchAll = createConfigTargetMatchPattern(matchKindAll, matchScopeAll);

export function findBestMatchingConfigTargets(target: ConfigTargetMatchPattern, configTargets: ClientConfigTarget[]): ClientConfigTarget[] {
    const matches: ClientConfigTarget[] = [];

    for (const t of configTargets) {
        if (!target.kind[t.kind] || !target.scope[t.scope]) continue;
        if (matches.length && (matches[0].kind !== t.kind || matches[0].scope !== t.scope)) break;
        matches.push(t);
    }

    return matches;
}

export function _buildQuickPickBestMatchTargetFn(kind: Partial<ConfigKindMask>, scope: Partial<ConfigScopeMask>): TargetBestMatchFn {
    const match = createConfigTargetMatchPattern(kind, scope);
    return buildQuickPickBestMatchTargetFn(match);
}

export function buildQuickPickBestMatchTargetFn(match: ConfigTargetMatchPattern): TargetBestMatchFn {
    return async function (configTargets: ClientConfigTarget[]) {
        const found = findBestMatchingConfigTargets(match, configTargets);
        if (!found.length) throw new UnableToFindTarget('No matching configuration found.');
        if (found.length === 1) return found[0];

        const sel = await vscode.window.showQuickPick(
            found.map((f) => ({ label: f.name, _found: f })),
            { title: 'Choose Destination' }
        );
        return sel?._found;
    };
}

export async function quickPickBestMatchTarget(
    match: ConfigTargetMatchPattern,
    targets: ClientConfigTarget[]
): Promise<ClientConfigTarget | undefined> {
    const fn = buildQuickPickBestMatchTargetFn(match);
    return fn(targets);
}

export function filterClientConfigTargets(
    targets: ClientConfigTarget[],
    filterBy: ConfigTargetMatchPattern | TargetMatchFn
): ClientConfigTarget[] {
    const fn: TargetMatchFn = typeof filterBy === 'function' ? filterBy : filterClientConfigTarget(filterBy);
    return targets.filter(fn);
}

export function filterClientConfigTarget(pattern: ConfigTargetMatchPattern): TargetMatchFn {
    return (t) => doesTargetMatchPattern(t, pattern);
}

export function doesTargetMatchPattern(target: ClientConfigTarget, pattern: ConfigTargetMatchPattern): boolean {
    return pattern.kind[target.kind] && pattern.scope[target.scope];
}

export function createConfigTargetMatchPattern(kind: Partial<ConfigKindMask>, scope: Partial<ConfigScopeMask>): ConfigTargetMatchPattern {
    return {
        kind: fillKind(kind),
        scope: fillScope(scope),
    };
}

export function negatePattern(p: ConfigTargetMatchPattern): ConfigTargetMatchPattern {
    return {
        kind: negateKind(p.kind),
        scope: negateScope(p.scope),
    };
}

export function andPattern(a: ConfigTargetMatchPattern, b: ConfigTargetMatchPattern): ConfigTargetMatchPattern {
    return {
        kind: andKeys(a.kind, b.kind, KindKeys),
        scope: andKeys(a.scope, b.scope, ScopeKeys),
    };
}

function fillKind(kind: Partial<ConfigKindMask>): ConfigKindMask {
    return merge(matchKindNone, kind, KindKeys);
}

function fillScope(scope: Partial<ConfigScopeMask>): ConfigScopeMask {
    return merge(matchScopeNone, scope, ScopeKeys);
}

function merge<T>(a: T, b: Partial<T>, keys: readonly (keyof T)[]): T {
    const v: Partial<T> = {};
    for (const key of keys) {
        const value = b[key];
        if (value !== undefined) {
            v[key] = value;
        }
    }
    return Object.assign({}, a, v);
}

function andKeys<K extends keyof any>(a: Record<K, boolean>, b: Record<K, boolean>, keys: readonly K[]): Record<K, boolean> {
    const r: Partial<Record<K, boolean>> = {};
    for (const k of keys) {
        r[k] = a[k] && b[k];
    }
    return r as Record<K, boolean>;
}

function negateKind(k: ConfigKindMask): ConfigKindMask {
    return { dictionary: !k.dictionary, cspell: !k.cspell, vscode: !k.vscode };
}

function negateScope(s: ConfigScopeMask): ConfigScopeMask {
    return { unknown: !s.unknown, folder: !s.folder, workspace: !s.workspace, user: !s.user };
}

export function createClientConfigTargetCSpell(configUri: vscode.Uri, scope: ClientConfigScope, name?: string): ClientConfigTargetCSpell {
    return {
        kind: 'cspell',
        scope,
        name: name || uriToName(configUri),
        configUri,
    };
}

export function createClientConfigTargetDictionary(
    dictionaryUri: vscode.Uri,
    scope: ClientConfigScope,
    name?: string
): ClientConfigTargetDictionary {
    return {
        kind: 'dictionary',
        scope,
        name: name || uriToName(dictionaryUri),
        dictionaryUri,
    };
}

export function createClientConfigTargetVSCode(
    target: vscode.ConfigurationTarget,
    docUri: string | null | vscode.Uri | undefined,
    configScope: vscode.ConfigurationScope | undefined
): ClientConfigTargetVSCode {
    const scope = configurationTargetToDictionaryScope(target);
    const ct: ClientConfigTargetVSCode = {
        kind: 'vscode',
        scope,
        name: scope,
        docUri: toUri(docUri),
        configScope,
    };
    return ct;
}

export class UnableToFindTarget extends Error {
    constructor(msg: string) {
        super(msg);
    }
}
