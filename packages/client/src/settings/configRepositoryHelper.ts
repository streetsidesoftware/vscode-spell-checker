import { toUri } from 'common-utils/uriHelper.js';
import { ConfigKind, ConfigTarget, ConfigTargetCSpell, ConfigTargetDictionary, ConfigTargetVSCode } from '../server';
import { ConfigRepository, CSpellConfigRepository, VSCodeRepository } from './configRepository';
import { dictionaryScopeToConfigurationTarget } from './targetAndScope';

const KnownTargetKinds = new Set<ConfigKind>(['dictionary', 'cspell', 'vscode']);

export function configTargetToConfigRepo(target: ConfigTargetDictionary): undefined;
export function configTargetToConfigRepo(target: ConfigTargetVSCode): VSCodeRepository;
export function configTargetToConfigRepo(target: ConfigTargetCSpell): CSpellConfigRepository;
export function configTargetToConfigRepo(target: ConfigTarget): ConfigRepository | undefined;
export function configTargetToConfigRepo(target: ConfigTarget): ConfigRepository | undefined {
    if (!KnownTargetKinds.has(target.kind)) throw new Error(`Unknown target ${target.kind}`);
    switch (target.kind) {
        case 'dictionary':
            return undefined;
        case 'cspell':
            return new CSpellConfigRepository(toUri(target.configUri), target.name);
        case 'vscode':
            return new VSCodeRepository(dictionaryScopeToConfigurationTarget(target.scope), toUri(target.docUri));
    }
}
