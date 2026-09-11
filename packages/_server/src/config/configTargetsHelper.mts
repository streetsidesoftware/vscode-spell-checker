import type { DictionaryDefinitionCustom } from '@cspell/cspell-types';
import { toFileUri, toUri } from '@internal/common-utils/uriHelper';
import { capitalize } from '@internal/common-utils/util';

import type { WorkspaceConfigForDocument } from '../api.js';
import type {
    ConfigScope,
    ConfigScopeVScode,
    ConfigTarget,
    ConfigTargetCSpell,
    ConfigTargetDictionary,
    ConfigTargetVSCode,
} from './configTargets.mjs';
import { ConfigKinds, ConfigScopes, weight } from './configTargets.mjs';
import type { CSpellUserAndExtensionSettings } from './cspellConfig/index.mjs';
import { configDefaults } from './cspellConfig/index.mjs';
import type { ActionAddToTargets } from './cspellConfig/SpellCheckerSettings.mjs';
import type { CSpellSettingsWithFileSource } from './documentSettings.mjs';
import { extractCSpellFileConfigurations, extractTargetDictionaries, filterExistingCSpellFileConfigurations } from './documentSettings.mjs';

export async function calculateConfigTargets(
    settings: CSpellUserAndExtensionSettings,
    workspaceConfig: WorkspaceConfigForDocument,
    configFilesFound?: string[],
): Promise<ConfigTarget[]> {
    const found = new Set(configFilesFound);
    function isFound(filename: string) {
        if (found.has(filename)) return true;
        const href = toFileUri(filename).toString();
        return found.has(href);
    }
    const allowedTargets = settings.allowWordsToBeAddTo || configDefaults.allowWordsToBeAddTo;
    const targets: ConfigTarget[] = [];
    const possibleSources = extractCSpellFileConfigurations(settings).filter((cfg) => !cfg.readonly);
    const sources = configFilesFound
        ? possibleSources.filter((cfg) => isFound(cfg.source.filename))
        : await filterExistingCSpellFileConfigurations(possibleSources);
    const dictionaries = extractTargetDictionaries(settings);

    targets.push(...workspaceConfigToTargets(allowedTargets, workspaceConfig));
    targets.push(...cspellToTargets(allowedTargets, sources));
    targets.push(...dictionariesToTargets(allowedTargets, dictionaries));

    return sortTargets(targets);
}

function* workspaceConfigToTargets(
    addToTargets: ActionAddToTargets,
    workspaceConfig: WorkspaceConfigForDocument,
): Generator<ConfigTargetVSCode> {
    function toTarget(scope: ConfigScopeVScode): ConfigTargetVSCode {
        return {
            kind: ConfigKinds.Vscode,
            scope,
            name: capitalize(scope),
            docUri: workspaceConfig.uri,
            folderUri: workspaceConfig.workspaceFolder,
            has: {
                words: workspaceConfig.words[scope],
                ignoreWords: workspaceConfig.ignoreWords[scope],
            },
        };
    }

    if (addToTargets.user) {
        yield toTarget(ConfigScopes.User);
    }

    // If it is part of a workspace folder, it is either a multi-root or single root workspace
    if (addToTargets.workspace && workspaceConfig.workspaceFolder) {
        yield toTarget(ConfigScopes.Workspace);
    }

    // If there is a workspace file, give the folder option.
    if (addToTargets.folder && workspaceConfig.workspaceFile) {
        yield toTarget(ConfigScopes.Folder);
    }
}

function basename(path: string): string {
    return path.split(/[/\\]/g).slice(-1).join('');
}

function cspellToTargets(addToTargets: ActionAddToTargets, sources: CSpellSettingsWithFileSource[]): ConfigTargetCSpell[] {
    function toTarget(cfg: CSpellSettingsWithFileSource, index: number): ConfigTargetCSpell {
        return {
            kind: ConfigKinds.Cspell,
            scope: ConfigScopes.Unknown,
            name: cfg.name || basename(cfg.source.filename),
            configUri: toUri(cfg.source.filename).toString(),
            has: {
                words: cfg.words && true,
                ignoreWords: cfg.ignoreWords && true,
            },
            sortKey: index,
        };
    }
    return addToTargets.cspell ? sources.map(toTarget) : [];
}

function dictionariesToTargets(addToTargets: ActionAddToTargets, dicts: DictionaryDefinitionCustom[]): ConfigTargetDictionary[] {
    function* dictToT(d: DictionaryDefinitionCustom): Generator<ConfigTargetDictionary> {
        const scopeMask = extractDictScopeFromCustomDictionary(d);
        const base: ConfigTargetDictionary = {
            kind: 'dictionary',
            name: d.name,
            dictionaryUri: toUri(d.path).toString(),
            scope: ConfigScopes.Unknown,
        };
        if (scopeMask & scopeMaskMap.user) yield { ...base, scope: ConfigScopes.User };
        if (scopeMask & scopeMaskMap.workspace) yield { ...base, scope: ConfigScopes.Workspace };
        if (scopeMask & scopeMaskMap.folder) yield { ...base, scope: ConfigScopes.Folder };
        if (scopeMask & scopeMaskMap.unknown) yield { ...base, scope: ConfigScopes.Unknown };
    }

    return addToTargets.dictionaries ? dicts.map(dictToT).flatMap((x) => [...x]) : [];
}

type DictScopeMapKnown = Record<ConfigScope, number>;
interface DictScopeMap extends DictScopeMapKnown {
    unknown: number;
}

const scopeMaskMap: DictScopeMap = {
    user: 1 << 0,
    workspace: 1 << 1,
    folder: 1 << 2,
    unknown: 1 << 3,
};

type ScopeMask = number;

function extractDictScopeFromCustomDictionary(dict: DictionaryDefinitionCustom): ScopeMask {
    const { scope } = dict;
    const scopes = typeof scope === 'string' ? [scope] : scope || [];
    let ds: ScopeMask = 0;
    for (const s of scopes) {
        ds |= scopeMaskMap[s] || 0;
    }
    return ds || scopeMaskMap.unknown;
}

/**
 * Use to sort highest to lowest priority
 * @param a - target
 * @param b - target
 * @returns
 */
function compareTarget(a: ConfigTarget, b: ConfigTarget): number {
    return weight(b) - weight(a) || (a.sortKey || 0) - (b.sortKey || 0);
}

function sortTargets(t: ConfigTarget[]): ConfigTarget[] {
    return t.sort(compareTarget);
}

export const __testing__ = {
    workspaceConfigToTargets,
    dictionariesToTargets,
    cspellToTargets,
    sortTargets,
};
