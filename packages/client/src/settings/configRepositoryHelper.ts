import { CSpellUserSettings } from '../client';
import { toUri } from '../util/uriHelper';
import {
    ClientConfigKind,
    ClientConfigTarget,
    ClientConfigTargetCSpell,
    ClientConfigTargetDictionary,
    ClientConfigTargetVSCode,
} from './clientConfigTarget';
import {
    ConfigRepository,
    createCSpellConfigRepository,
    createVSCodeConfigRepository,
    CSpellConfigRepository,
    VSCodeRepository,
} from './configRepository';
import { ConfigKeys, ConfigUpdater } from './configUpdater';
import { dictionaryScopeToConfigurationTarget } from './targetAndScope';

const KnownTargetKinds = new Set<ClientConfigKind>(['dictionary', 'cspell', 'vscode']);

export function configTargetToConfigRepo(target: ClientConfigTargetDictionary): undefined;
export function configTargetToConfigRepo(target: ClientConfigTargetVSCode): VSCodeRepository;
export function configTargetToConfigRepo(target: ClientConfigTargetCSpell): CSpellConfigRepository;
export function configTargetToConfigRepo(target: ClientConfigTarget): ConfigRepository | undefined;
export function configTargetToConfigRepo(target: ClientConfigTarget): ConfigRepository | undefined {
    if (!KnownTargetKinds.has(target.kind)) throw new Error(`Unknown target ${target.kind}`);
    switch (target.kind) {
        case 'dictionary':
            return undefined;
        case 'cspell':
            return createCSpellConfigRepository(toUri(target.configUri), target.name);
        case 'vscode':
            return createVSCodeConfigRepository(
                dictionaryScopeToConfigurationTarget(target.scope),
                target.configScope || target.docUri,
                !!target.useMerge
            );
    }
}

/**
 * Apply and update to an array of targets.
 *
 * @param updater - update to apply
 * @param targets - targets to apply.
 * @returns
 * - resolves if it was able to apply the update.
 * - rejects with `ErrorCannotFindConfigRepoForTarget` if it could not find a ConfigRepository for one of the targets.
 */
export function applyUpdateToConfigTargets<K extends ConfigKeys>(updater: ConfigUpdater<K>, targets: ClientConfigTarget[]): Promise<void> {
    const repos = targets.map(mapTargetToRepo);
    const results = repos.map((r) => r.update(updater));
    return Promise.all(results).then(() => {});
}

/**
 * Read value from Config Targets
 *
 * @param updater - update to apply
 * @param targets - targets to apply.
 * @returns
 * - resolves if it was able to read the values.
 * - rejects with `ErrorCannotFindConfigRepoForTarget` if it could not find a ConfigRepository for one of the targets.
 */
export function readFromConfigTargets<K extends ConfigKeys>(
    key: K,
    targets: ClientConfigTarget[]
): Promise<[ClientConfigTarget, Pick<CSpellUserSettings, K>][]> {
    type ReadFromConfigTargetsResultItem = [ClientConfigTarget, Pick<CSpellUserSettings, K>];

    const readResults = targets.map(async (target) => {
        const repo = mapTargetToRepo(target);
        const value = await repo.getValue(key);
        return [target, value] as ReadFromConfigTargetsResultItem;
    });

    return Promise.all(readResults);
}

function mapTargetToRepo(t: ClientConfigTarget) {
    const r = configTargetToConfigRepo(t);
    if (r === undefined) throw new ErrorCannotFindConfigRepoForTarget(t);
    return r;
}

export class ErrorCannotFindConfigRepoForTarget extends Error {
    constructor(readonly target: ClientConfigTarget) {
        super(`Cannot find appropriate config repository for ${target.kind}:${target.name}`);
    }
}
