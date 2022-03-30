import type { DictionaryDefinitionCustom } from '@cspell/cspell-types';
import { genSequence } from 'gensequence';
import * as Path from 'path';
import { URI as Uri } from 'vscode-uri';
import { WorkspaceConfigForDocument } from '../api';
import { capitalize } from 'common-utils/util.js';
import {
    ConfigKinds,
    ConfigScope,
    ConfigScopes,
    ConfigScopeVScode,
    ConfigTarget,
    ConfigTargetCSpell,
    ConfigTargetDictionary,
    ConfigTargetVSCode,
    weight,
} from './configTargets';
import { CSpellUserSettings } from './cspellConfig';
import { CSpellSettingsWithFileSource, extractCSpellFileConfigurations, extractTargetDictionaries } from './documentSettings';

export function calculateConfigTargets(settings: CSpellUserSettings, workspaceConfig: WorkspaceConfigForDocument): ConfigTarget[] {
    const targets: ConfigTarget[] = [];
    const sources = extractCSpellFileConfigurations(settings).filter((cfg) => !cfg.readonly);
    const dictionaries = extractTargetDictionaries(settings);

    targets.push(...workspaceConfigToTargets(workspaceConfig));
    targets.push(...cspellToTargets(sources));
    targets.push(...dictionariesToTargets(dictionaries));

    return sortTargets(targets);
}

function* workspaceConfigToTargets(workspaceConfig: WorkspaceConfigForDocument): Generator<ConfigTargetVSCode> {
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

    yield toTarget(ConfigScopes.User);

    // If it is part of a workspace folder, it is either a multi-root or single root workspace
    if (workspaceConfig.workspaceFolder) {
        yield toTarget(ConfigScopes.Workspace);
    }

    // If there is a workspace file, give the folder option.
    if (workspaceConfig.workspaceFile) {
        yield toTarget(ConfigScopes.Folder);
    }
}

function cspellToTargets(sources: CSpellSettingsWithFileSource[]): ConfigTargetCSpell[] {
    function toTarget(cfg: CSpellSettingsWithFileSource, index: number): ConfigTargetCSpell {
        return {
            kind: ConfigKinds.Cspell,
            scope: ConfigScopes.Unknown,
            name: cfg.name || Path.basename(cfg.source.filename),
            configUri: Uri.file(cfg.source.filename).toString(),
            has: {
                words: cfg.words && true,
                ignoreWords: cfg.ignoreWords && true,
            },
            sortKey: index,
        };
    }
    return sources.map(toTarget);
}

function dictionariesToTargets(dicts: DictionaryDefinitionCustom[]): ConfigTargetDictionary[] {
    function* dictToT(d: DictionaryDefinitionCustom): Generator<ConfigTargetDictionary> {
        const scopeMask = extractDictScopeFromCustomDictionary(d);
        const base: ConfigTargetDictionary = {
            kind: 'dictionary',
            name: d.name,
            dictionaryUri: Uri.file(d.path).toString(),
            scope: ConfigScopes.Unknown,
        };
        if (scopeMask & scopeMaskMap.user) yield { ...base, scope: ConfigScopes.User };
        if (scopeMask & scopeMaskMap.workspace) yield { ...base, scope: ConfigScopes.Workspace };
        if (scopeMask & scopeMaskMap.folder) yield { ...base, scope: ConfigScopes.Folder };
        if (scopeMask & scopeMaskMap.unknown) yield { ...base, scope: ConfigScopes.Unknown };
    }

    return genSequence(dicts).concatMap(dictToT).toArray();
}

type DictScopeMapKnown = {
    [key in ConfigScope]: number;
};
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
