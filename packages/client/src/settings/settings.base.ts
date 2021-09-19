/**
 * This file contains settings related functions, but are not exported out of the folder.
 */

import { CSpellUserSettings } from '../client';
import { ClientConfigTarget, orderScope } from './clientConfigTarget';
import { applyUpdateToConfigTargets, readFromConfigTargets } from './configRepositoryHelper';
import { ConfigTargetMatchPattern, filterClientConfigTargets } from './configTargetHelper';
import { configUpdaterForKey } from './configUpdater';

export function readConfigTargetValues<K extends keyof CSpellUserSettings>(
    targets: ClientConfigTarget[],
    key: K
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
    filter?: ConfigTargetMatchPattern
): Promise<void> {
    targets = filter ? filterClientConfigTargets(targets, filter) : targets;
    const updater = configUpdaterForKey<K>(key, value);
    return applyUpdateToConfigTargets(updater, targets);
}

export function orderTargetsLocalToGlobal(targets: ClientConfigTarget[]): ClientConfigTarget[] {
    const scopes = targets.map((t) => t.scope);
    const orderedScopes = orderScope(scopes, true);
    const orderedTargets: ClientConfigTarget[] = [];
    orderedScopes.map((scope) => targets.filter((t) => t.scope === scope)).forEach((t) => t.forEach((t) => orderedTargets.push(t)));
    return orderedTargets;
}
