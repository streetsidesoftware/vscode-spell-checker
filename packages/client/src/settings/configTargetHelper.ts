/**
 * This helper is to help with matching possible configuration targets to configuration fields.
 */

import * as vscode from 'vscode';
import { toUri } from 'common-utils/uriHelper.js';
import { mustBeDefined } from '../util';
import type { ClientConfigKind, ClientConfigScope, ClientConfigTarget, ClientConfigTargetVSCode } from './clientConfigTarget';
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

export const matchScopeNone: ConfigScopeMask = { unknown: false, folder: false, workspace: false, user: false };
export const matchScopeAll: ConfigScopeMask = { unknown: true, folder: true, workspace: true, user: true };
export const matchScopeAllButUser: ConfigScopeMask = { unknown: true, folder: true, workspace: true, user: false };
export const matchScopeUser: ConfigScopeMask = { unknown: false, folder: false, workspace: false, user: true };
export const matchScopeWorkspace: ConfigScopeMask = { unknown: false, folder: false, workspace: true, user: false };
export const matchScopeFolder: ConfigScopeMask = { unknown: false, folder: true, workspace: false, user: false };

export type TargetMatchFn = (
    configTargets: ClientConfigTarget[]
) => Promise<ClientConfigTarget | undefined> | ClientConfigTarget | undefined;

export const dictionaryTargetBestMatch = buildMatchTargetFn(matchKindAll, matchScopeAllButUser);
export const dictionaryTargetBestMatchUser = buildMatchTargetFn(matchKindAll, matchScopeUser);
export const dictionaryTargetBestMatchWorkspace = buildMatchTargetFn(matchKindAll, matchScopeWorkspace);
export const dictionaryTargetBestMatchFolder = buildMatchTargetFn(matchKindAll, matchScopeFolder);
export const dictionaryTargetCSpell = buildMatchTargetFn(matchKindCSpell, matchScopeAll);
export const dictionaryTargetVSCodeUser = buildMatchTargetFn(matchKindVSCode, matchScopeUser);
export const dictionaryTargetVSCodeWorkspace = buildMatchTargetFn(matchKindVSCode, matchScopeWorkspace);
export const dictionaryTargetVSCodeFolder = buildMatchTargetFn(matchKindVSCode, matchScopeFolder);

export function findMatchingConfigTargets(target: ConfigTargetMatchPattern, configTargets: ClientConfigTarget[]): ClientConfigTarget[] {
    const matches: ClientConfigTarget[] = [];

    for (const t of configTargets) {
        if (!target.kind[t.kind] || !target.scope[t.scope]) continue;
        if (matches.length && (matches[0].kind !== t.kind || matches[0].scope !== t.scope)) break;
        matches.push(t);
    }

    return matches;
}

export function buildMatchTargetFn(kind: Partial<ConfigKindMask>, scope: Partial<ConfigScopeMask>): TargetMatchFn {
    const match = {
        kind: fillKind(kind),
        scope: fillScope(scope),
    };

    return async function (configTargets: ClientConfigTarget[]) {
        const found = findMatchingConfigTargets(match, configTargets);
        if (!found.length) throw new UnableToFindTarget('No matching configuration found.');
        if (found.length === 1) return found[0];

        const sel = await vscode.window.showQuickPick(
            found.map((f) => ({ label: f.name, _found: f })),
            { title: 'Choose Destination' }
        );
        return sel?._found;
    };
}

function fillKind(kind: Partial<ConfigKindMask>): ConfigKindMask {
    return merge(matchKindNone, kind);
}

function fillScope(scope: Partial<ConfigScopeMask>): ConfigScopeMask {
    return merge(matchScopeNone, scope);
}

function merge<T>(a: T, b: Partial<T>): T {
    const v: T = { ...a };
    type KeyOfT = keyof T;
    for (const [key, value] of Object.entries(b) as [KeyOfT, T[KeyOfT] | undefined][]) {
        if (value !== undefined) {
            v[key] = value;
        }
    }
    return v;
}

export function createClientConfigTargetFromConfigurationTarget(
    target: vscode.ConfigurationTarget,
    uri: string | null | vscode.Uri | undefined
): ClientConfigTargetVSCode {
    uri = toUri(uri);
    const scope = configurationTargetToDictionaryScope(target);
    if (scope === 'user') {
        return {
            name: scope,
            scope,
            kind: 'vscode',
            docUri: scope === 'user' ? uri : mustBeDefined(uri),
        };
    }
    const ct: ClientConfigTargetVSCode = {
        name: scope,
        scope,
        kind: 'vscode',
        docUri: mustBeDefined(uri),
    };
    return ct;
}

export class UnableToFindTarget extends Error {
    constructor(msg: string) {
        super(msg);
    }
}
