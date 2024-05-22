import type { ConfigurationScope, TextDocument, Uri } from 'vscode';
import { FileType, window, workspace } from 'vscode';

import * as di from '../di.mjs';
import { toUri } from '../util/uriHelper.mjs';
import { findMatchingDocument } from '../vscode/findDocument.mjs';
import type { ClientConfigTarget } from './clientConfigTarget.js';
import {
    createConfigTargetMatchPattern,
    filterClientConfigTargets,
    matchKindAll,
    matchScopeAll,
    patternMatchNoDictionaries,
} from './configTargetHelper.mjs';
import type { TargetsAndScopes } from './index.mjs';
import type { ConfigurationTarget } from './index.mjs';
import { mapConfigTargetToClientConfigTarget } from './mappers/configTarget.mjs';
import { configurationTargetToClientConfigScope, configurationTargetToClientConfigScopeInfluenceRange } from './targetAndScope.mjs';

export async function targetsAndScopeFromConfigurationTarget(
    cfgTarget: ConfigurationTarget,
    docUri?: string | null | Uri | undefined,
    configScope?: ConfigurationScope,
    cfgTargetIsExact?: boolean,
): Promise<TargetsAndScopes> {
    const scopes = cfgTargetIsExact
        ? [configurationTargetToClientConfigScope(cfgTarget)]
        : configurationTargetToClientConfigScopeInfluenceRange(cfgTarget);
    const pattern = createConfigTargetMatchPattern(matchKindAll, matchScopeAll, { dictionary: false });

    docUri = toUri(docUri);
    const targets = await (docUri ? targetsForUri(docUri, pattern) : targetsForTextDocument(window.activeTextEditor?.document, pattern));
    return {
        targets: targets.map((t) => (t.kind === 'vscode' ? { ...t, configScope } : t)),
        scopes,
    };
}

export async function targetsFromConfigurationTarget(
    cfgTarget: ConfigurationTarget,
    docUri?: string | null | Uri | undefined,
    configScope?: ConfigurationScope,
): Promise<ClientConfigTarget[]> {
    const r = await targetsAndScopeFromConfigurationTarget(cfgTarget, docUri, configScope);
    const { targets, scopes } = r;
    const allowedScopes = new Set(scopes);
    return targets.filter((t) => allowedScopes.has(t.scope));
}

/**
 * Calculate possible targets for a given document.
 * @param document - TextDocument to calculate targets for.
 * @param patternMatch - optional pattern match to filter out specific targets. By default, dictionary targets are filtered out.
 * @returns list of targets.
 */
export async function targetsForTextDocument(
    document: TextDocument | { uri: Uri; languageId?: string } | undefined,
    patternMatch = patternMatchNoDictionaries,
) {
    const { uri, languageId } = document || {};
    const config = await di.get('client').getConfigurationForDocument({ uri, languageId }, {});
    const targets = config.configTargets.map(mapConfigTargetToClientConfigTarget);
    return filterClientConfigTargets(targets, patternMatch);
}

/**
 * Calculate possible targets for a given uri.
 * @param docUri - uri of the TextDocument.
 * @param patternMatch - optional pattern match to filter out specific targets. By default, dictionary targets are filtered out.
 * @returns list of targets.
 */
export async function targetsForUri(docUri?: string | null | Uri | undefined, patternMatch = patternMatchNoDictionaries) {
    docUri = toUri(docUri);
    const document = docUri ? await uriToTextDocInfo(docUri) : window.activeTextEditor?.document;
    return targetsForTextDocument(document, patternMatch);
}

async function uriToTextDocInfo(uri: Uri): Promise<{ uri: Uri; languageId?: string }> {
    const doc = findMatchingDocument(uri);
    if (doc) return doc;
    const fsStat = await workspace.fs.stat(uri);
    if (fsStat.type !== FileType.File) return { uri };
    return await workspace.openTextDocument(uri);
}
