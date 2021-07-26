import { toUri } from 'common-utils/uriHelper.js';
import {
    ClientConfigKind,
    ClientConfigTarget,
    ClientConfigTargetCSpell,
    ClientConfigTargetDictionary,
    ClientConfigTargetVSCode,
} from './clientConfigTarget';
import { ConfigRepository, createCSpellConfigRepository, CSpellConfigRepository, VSCodeRepository } from './configRepository';
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
            return new VSCodeRepository(dictionaryScopeToConfigurationTarget(target.scope), target.docUri);
    }
}
