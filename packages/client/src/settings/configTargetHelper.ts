/**
 * This helper is to help with matching possible configuration targets to configuration fields.
 */

import { uriToName } from 'common-utils/uriHelper.js';
import * as vscode from 'vscode';
import { toUri } from '../util/uriHelper';
import {
    ClientConfigKind,
    ClientConfigScope,
    ClientConfigTarget,
    ClientConfigTargetCSpell,
    ClientConfigTargetDictionary,
    ClientConfigTargetVSCode,
    ConfigKinds,
} from './clientConfigTarget';
import { configurationTargetToDictionaryScope } from './targetAndScope';

type ConfigKindMask = {
    [key in ClientConfigKind]?: boolean;
};

type ConfigScopeMask = {
    [key in ClientConfigScope]?: boolean;
};

export type ConfigTargetMatchPattern = {
    [key in ClientConfigKind | ClientConfigScope]?: boolean;
};

export type ConfigTargetMatchPatternKey = keyof ConfigTargetMatchPattern;

type ConfigTargetMatchPatternKeyNames = {
    [key in ConfigTargetMatchPatternKey]-?: key;
};

const configTargetMatchPatternKeyNames: ConfigTargetMatchPatternKeyNames = {
    dictionary: 'dictionary',
    cspell: 'cspell',
    vscode: 'vscode',
    unknown: 'unknown',
    folder: 'folder',
    workspace: 'workspace',
    user: 'user',
} as const;

export const matchKindNone: ConfigKindMask = { dictionary: false, cspell: false, vscode: false };
export const matchKindAll: ConfigKindMask = { dictionary: true, cspell: true, vscode: true };
export const matchKindConfig: ConfigKindMask = { cspell: true, vscode: true };
export const matchKindCSpell: ConfigKindMask = { cspell: true };
export const matchKindVSCode: ConfigKindMask = { vscode: true };
export const matchKindDictionary: ConfigKindMask = { dictionary: true, cspell: false, vscode: false };

export const matchScopeNone: ConfigScopeMask = { unknown: false, folder: false, workspace: false, user: false };
export const matchScopeAll: ConfigScopeMask = { unknown: true, folder: true, workspace: true, user: true };
export const matchScopeAllButUser: ConfigScopeMask = { unknown: true, folder: true, workspace: true, user: false };
export const matchScopeUser: ConfigScopeMask = { user: true };
export const matchScopeWorkspace: ConfigScopeMask = { workspace: true };
export const matchScopeFolder: ConfigScopeMask = { folder: true };
export const matchScopeUnknown: ConfigScopeMask = { unknown: true };

export type MatchTargetsSyncFn = (configTargets: ClientConfigTarget[]) => ClientConfigTarget[] | undefined;

export type MatchTargetsAsyncFn = (
    configTargets: ClientConfigTarget[]
) => Promise<ClientConfigTarget[] | undefined> | ClientConfigTarget[] | undefined;

export type MatchTargetsSingleSyncFn = (configTargets: ClientConfigTarget[]) => [ClientConfigTarget] | undefined;

export type MatchTargetsSingleAsyncFn = (
    configTargets: ClientConfigTarget[]
) => Promise<ClientConfigTarget[] | undefined> | [ClientConfigTarget] | undefined;

export type MatchTargetsFn = MatchTargetsSyncFn | MatchTargetsSingleSyncFn | MatchTargetsAsyncFn | MatchTargetsSingleAsyncFn;

export type TargetMatchFn = (target: ClientConfigTarget) => boolean;

const KindKeys = Object.freeze(Object.values(ConfigKinds));
// const ScopeKeys = Object.freeze(Object.keys(matchScopeAll) as ClientConfigScope[]);
const AllKeys = Object.freeze(Object.values(configTargetMatchPatternKeyNames));

export const dictionaryTargetBestMatches = _buildQuickPickBestMatchTargetFn(matchKindAll, matchScopeAllButUser);
export const dictionaryTargetBestMatchesUser = _buildQuickPickBestMatchTargetFn(matchKindAll, matchScopeUser);
export const dictionaryTargetBestMatchesWorkspace = _buildQuickPickBestMatchTargetFn(matchKindAll, matchScopeWorkspace);
export const dictionaryTargetBestMatchesFolder = _buildQuickPickBestMatchTargetFn(matchKindAll, matchScopeFolder);
export const dictionaryTargetBestMatchesCSpell = _buildQuickPickBestMatchTargetFn(matchKindCSpell, matchScopeAll);
export const dictionaryTargetBestMatchesVSCodeUser = _buildQuickPickBestMatchTargetFn(matchKindVSCode, matchScopeUser);
export const dictionaryTargetBestMatchesVSCodeWorkspace = _buildQuickPickBestMatchTargetFn(matchKindVSCode, matchScopeWorkspace);
export const dictionaryTargetBestMatchesVSCodeFolder = _buildQuickPickBestMatchTargetFn(matchKindVSCode, matchScopeFolder);

export const patternMatchNoDictionaries = createConfigTargetMatchPattern(negateKind(matchKindDictionary), matchScopeAll);
export const patternMatchAll = createConfigTargetMatchPattern(matchKindAll, matchScopeAll);

export function findBestMatchingConfigTargets(
    pattern: ConfigTargetMatchPattern,
    configTargets: ClientConfigTarget[]
): ClientConfigTarget[] {
    const matches: ClientConfigTarget[] = [];

    for (const t of configTargets) {
        if (!pattern[t.kind] || !pattern[t.scope]) continue;
        if (matches.length && (matches[0].kind !== t.kind || matches[0].scope !== t.scope)) break;
        matches.push(t);
    }

    return matches;
}

export function _buildQuickPickBestMatchTargetFn(...params: ConfigTargetMatchPattern[]): MatchTargetsFn {
    const match = createConfigTargetMatchPattern(...params);
    return buildQuickPickBestMatchTargetFn(match);
}

export function buildQuickPickBestMatchTargetFn(match: ConfigTargetMatchPattern, canPickMany: boolean = false): MatchTargetsFn {
    return async function (configTargets: ClientConfigTarget[]) {
        const foundTargets = findBestMatchingConfigTargets(match, configTargets);
        return quickPickTargets(foundTargets, canPickMany);
    };
}

export function buildQuickPickMatchTargetFn(match: ConfigTargetMatchPattern): MatchTargetsFn {
    return async function (configTargets: ClientConfigTarget[]) {
        const foundTargets = filterClientConfigTargets(configTargets, match);
        return quickPickTargets(foundTargets);
    };
}

export async function quickPickBestMatchTarget(
    targets: ClientConfigTarget[],
    match: ConfigTargetMatchPattern,
    canPickMany?: false | undefined
): Promise<[ClientConfigTarget] | undefined>;
export async function quickPickBestMatchTarget(
    targets: ClientConfigTarget[],
    match: ConfigTargetMatchPattern,
    canPickMany: true
): Promise<ClientConfigTarget[] | undefined>;
export async function quickPickBestMatchTarget(
    targets: ClientConfigTarget[],
    match: ConfigTargetMatchPattern,
    canPickMany: boolean = false
): Promise<ClientConfigTarget[] | undefined> {
    const fn = buildQuickPickBestMatchTargetFn(match, canPickMany);
    return fn(targets);
}

export async function quickPickTargets(
    targets: ClientConfigTarget[],
    canPickMany?: undefined | false
): Promise<[ClientConfigTarget] | undefined>;
export async function quickPickTargets(targets: ClientConfigTarget[], canPickMany: true): Promise<ClientConfigTarget[] | undefined>;
export async function quickPickTargets(
    targets: ClientConfigTarget[],
    canPickMany: boolean | undefined
): Promise<ClientConfigTarget[] | undefined>;
export async function quickPickTargets(
    targets: ClientConfigTarget[],
    canPickMany: boolean = false
): Promise<ClientConfigTarget[] | undefined> {
    if (!targets.length) throw new UnableToFindTarget('No matching configuration found.');
    if (targets.length === 1) return targets;

    const title = 'Choose Destination';
    const items = targets.map((f) => ({ label: f.name, _found: f }));

    // This bit of strangeness is done to keep the correct return type of `sel`.
    const sel = canPickMany
        ? await vscode.window.showQuickPick(items, { title, canPickMany: true })
        : await vscode.window.showQuickPick(items, { title });

    if (!sel) return undefined;
    const selected = Array.isArray(sel) ? sel : [sel];
    return selected.map((s) => s._found);
}

export async function quickPickTarget(targets: ClientConfigTarget[]): Promise<ClientConfigTarget | undefined> {
    const t = await quickPickTargets(targets, false);
    return t && t[0];
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
    return !!pattern[target.kind] && !!pattern[target.scope];
}

export function createConfigTargetMatchPattern(
    ...patterns: (ConfigTargetMatchPattern | ConfigTargetMatchPatternKey)[]
): ConfigTargetMatchPattern {
    let r: ConfigTargetMatchPattern = {};
    for (const p of patterns) {
        if (typeof p === 'string') {
            r[p] = true;
        } else {
            r = mergeKeys(r, p, AllKeys);
        }
    }
    return r;
}

export function negatePattern(p: ConfigTargetMatchPattern): ConfigTargetMatchPattern {
    return negKeys(p, AllKeys);
}

export function andPattern(a: ConfigTargetMatchPattern, b: ConfigTargetMatchPattern): ConfigTargetMatchPattern {
    return andKeys(a, b, AllKeys);
}

function andKeys<K extends keyof ConfigTargetMatchPattern>(
    a: ConfigTargetMatchPattern,
    b: ConfigTargetMatchPattern,
    keys: readonly K[]
): ConfigTargetMatchPattern {
    const r: ConfigTargetMatchPattern = {};
    for (const k of keys) {
        const value = and(a[k], b[k]);
        if (value !== undefined) {
            r[k] = value;
        }
    }
    return r;
}

/**
 * copy ALL of `a` and selected keys from `b`
 * @param a
 * @param b
 * @param keys - keys to copy from b
 * @returns `a` merged with selected keys from `b`
 */
function mergeKeys<K extends keyof ConfigTargetMatchPattern>(
    a: ConfigTargetMatchPattern,
    b: ConfigTargetMatchPattern,
    keys: readonly K[]
): ConfigTargetMatchPattern {
    const r: ConfigTargetMatchPattern = Object.assign({}, a);
    for (const k of keys) {
        const value = b[k];
        if (value !== undefined) {
            r[k] = value;
        }
    }
    return r;
}

function negKeys<K extends keyof ConfigTargetMatchPattern>(a: ConfigTargetMatchPattern, keys: readonly K[]): ConfigTargetMatchPattern {
    const r: ConfigTargetMatchPattern = {};
    for (const k of keys) {
        r[k] = neg(a[k]);
    }
    return r;
}

function and(a: boolean | undefined, b: boolean | undefined): boolean | undefined {
    return a === undefined ? b : b === undefined ? a : a && b;
}

function neg(a: boolean | undefined): boolean | undefined {
    return a === undefined ? undefined : !a;
}

function negateKind(k: ConfigKindMask): ConfigKindMask {
    return negKeys(k, KindKeys);
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
