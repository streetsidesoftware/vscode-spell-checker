/**
 * This file contains settings related functions, but are not exported out of the folder.
 */

import type { CSpellUserSettings } from '../client/index.mjs';
import type { ClientConfigScope, ClientConfigTarget } from './clientConfigTarget.js';
import { orderScope } from './clientConfigTarget.js';
import { applyUpdateToConfigTargets, readFromConfigTargets } from './configRepositoryHelper.mjs';
import type { ConfigTargetMatchPattern } from './configTargetHelper.mjs';
import {
    filterClientConfigTargets,
    filterClientConfigTargetsByField,
    patternMatchNoDictionaries,
    quickPickBestMatchTarget,
    quickPickTargets,
} from './configTargetHelper.mjs';
import { configUpdaterForKey } from './configUpdater.mjs';
import type { TargetsAndScopes } from './settings.types.mjs';

export type { CSpellUserSettings } from '../client/index.mjs';
export { normalizeLocale } from '../client/index.mjs';

export function readConfigTargetValues<K extends keyof CSpellUserSettings>(
    targets: ClientConfigTarget[],
    key: K,
): Promise<[ClientConfigTarget, Pick<CSpellUserSettings, K>][]> {
    return readFromConfigTargets(key, targets);
}

export type ApplyValueOrFn<K extends keyof CSpellUserSettings> =
    | CSpellUserSettings[K]
    | ((v: CSpellUserSettings[K]) => CSpellUserSettings[K]);

export function applyToConfig<K extends keyof CSpellUserSettings>(
    targets: ClientConfigTarget[],
    key: K,
    value: ApplyValueOrFn<K>,
    filter?: ConfigTargetMatchPattern,
): Promise<void> {
    targets = filter ? filterClientConfigTargets(targets, filter) : targets;
    const updater = configUpdaterForKey<K>(key, value);
    return applyUpdateToConfigTargets(updater, targets);
}

export function orderTargetsLocalToGlobal(targets: ClientConfigTarget[]): ClientConfigTarget[] {
    const scopes = targets.map((t) => t.scope);
    const orderedScopes = orderScope(scopes, true);
    const orderedTargets: ClientConfigTarget[] = [];
    orderedScopes.map((scope) => targets.filter((t) => t.scope === scope)).forEach((t) => { t.forEach((t) => orderedTargets.push(t)); });
    return orderedTargets;
}

export async function setConfigFieldQuickPickBestTarget<K extends keyof CSpellUserSettings>(
    targets: ClientConfigTarget[],
    key: K,
    value: ApplyValueOrFn<K>,
): Promise<void> {
    const t = await quickPickBestMatchTarget(targets, patternMatchNoDictionaries);
    if (!t?.length) return;
    return applyToConfig(t, key, value);
}

export async function setConfigFieldQuickPick<K extends keyof CSpellUserSettings>(
    targets: ClientConfigTarget[],
    key: K,
    value: ApplyValueOrFn<K>,
): Promise<void> {
    targets = filterClientConfigTargetsByField(targets, key);
    const t = await quickPickTargets(targets);
    if (!t?.length) return;
    return applyToConfig(t, key, value);
}

/**
 * Simple Inherited Value calculation. Does not merge values.
 * @param mapTargetsToValue - an ordered map of target / values - ordered from local to global
 * @param target - desired target
 * @param key - configuration key
 * @returns - the value found or undefined.
 */
export function findInheritedTargetValue<K extends keyof CSpellUserSettings>(
    mapTargetsToValue: Map<ClientConfigTarget, CSpellUserSettings>,
    target: ClientConfigTarget,
    key: K,
): CSpellUserSettings[K] | undefined {
    let lastValue: CSpellUserSettings[K] | undefined = undefined;
    for (const [t, v] of [...mapTargetsToValue].reverse()) {
        if (t === target) break;
        lastValue ??= v[key];
    }

    return lastValue as undefined; /* Work around a TypeScript bug */
}

interface RelevantTargetInfo {
    /**
     * All Known Targets, even if they are not in scope.
     * Used to calculate possible targets. Should be in order from locale to global.
     */
    targets: ClientConfigTarget[];
    /**
     * Possible set of scope to apply any changes.
     */
    possibleScopes: ClientConfigScope[];
    /** All Known Targets, in order from local to global */
    orderedTargets: ClientConfigTarget[];
    /** ordered targets matching possible scopes. */
    possibleTargets: ClientConfigTarget[];
}

export function calcRelevantTargetInfo(targetsAndScopes: TargetsAndScopes): RelevantTargetInfo {
    const { targets, scopes: possibleScopes } = targetsAndScopes;
    const allowedScopes = new Set(orderScope(possibleScopes));
    const orderedTargets = orderTargetsLocalToGlobal(targets);
    const possibleTargets = orderedTargets.filter((t) => allowedScopes.has(t.scope));
    return {
        targets,
        possibleScopes,
        orderedTargets,
        possibleTargets,
    };
}
