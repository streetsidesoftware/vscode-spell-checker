import type { Command, ConfigurationScope, Diagnostic, Disposable, TextDocument, TextEdit, Uri } from 'vscode';
import { commands, FileType, Position, Range, Selection, TextEditorRevealType, window, workspace } from 'vscode';
import type { Position as LsPosition, Range as LsRange, TextEdit as LsTextEdit } from 'vscode-languageclient/node';

import { addWordToFolderDictionary, addWordToTarget, addWordToUserDictionary, addWordToWorkspaceDictionary, fnWTarget } from './addWords';
import { actionAutoFixSpellingIssues, handleApplyLsTextEdits, handleFixSpellingIssue } from './applyCorrections';
import type { ClientSideCommandHandlerApi } from './client';
import { actionSuggestSpellingCorrections } from './codeActions/actionSuggestSpellingCorrections';
import * as di from './di';
import { getCSpellDiags } from './diags';
import { onCommandUseDiagsSelectionOrPrompt } from './promptUser';
import type { ConfigTargetLegacy, TargetsAndScopes } from './settings';
import * as Settings from './settings';
import {
    ConfigurationTarget,
    createConfigFileRelativeToDocumentUri,
    normalizeTarget,
    setEnableSpellChecking,
    toggleEnableSpellChecker,
} from './settings';
import type { ClientConfigTarget } from './settings/clientConfigTarget';
import type { ConfigRepository } from './settings/configRepository';
import { createCSpellConfigRepository, createVSCodeConfigRepository } from './settings/configRepository';
import { configTargetToConfigRepo } from './settings/configRepositoryHelper';
import {
    createClientConfigTargetVSCode,
    createConfigTargetMatchPattern,
    dictionaryTargetBestMatches,
    dictionaryTargetBestMatchesCSpell,
    dictionaryTargetBestMatchesVSCodeFolder as dtVSCodeFolder,
    dictionaryTargetBestMatchesVSCodeUser as dtVSCodeUser,
    dictionaryTargetBestMatchesVSCodeWorkspace as dtVSCodeWorkspace,
    filterClientConfigTargets,
    matchKindAll,
    matchScopeAll,
    patternMatchNoDictionaries,
    quickPickTarget,
} from './settings/configTargetHelper';
import type { DictionaryTarget } from './settings/DictionaryTarget';
import { createDictionaryTargetForFile } from './settings/DictionaryTarget';
import { mapConfigTargetToClientConfigTarget } from './settings/mappers/configTarget';
import {
    configurationTargetToClientConfigScope,
    configurationTargetToClientConfigScopeInfluenceRange,
    configurationTargetToDictionaryScope,
    dictionaryScopeToConfigurationTarget,
} from './settings/targetAndScope';
import { catchErrors, handleErrors } from './util/errors';
import { performance, toMilliseconds } from './util/perf';
import { pVoid } from './util/pVoid';
import { scrollToText } from './util/textEditor';
import { toUri } from './util/uriHelper';
import { findMatchingDocument } from './vscode/findDocument';

const commandsFromServer: ClientSideCommandHandlerApi = {
    'cSpell.addWordsToConfigFileFromServer': (words, _documentUri, config) => {
        return addWordsToConfig(words, createCSpellConfigRepository(toUri(config.uri), config.name));
    },
    'cSpell.addWordsToDictionaryFileFromServer': (words, _documentUri, dict) => {
        return addWordsToDictionaryTarget(words, createDictionaryTargetForFile(toUri(dict.uri), dict.name));
    },
    'cSpell.addWordsToVSCodeSettingsFromServer': (words, documentUri, target) => {
        const cfgTarget = dictionaryScopeToConfigurationTarget(target);
        const cfgRepo = createVSCodeConfigRepository(cfgTarget, toUri(documentUri), false);
        return addWordsToConfig(words, cfgRepo);
    },
};

type CommandHandler = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key in string]: (...params: any[]) => void | Promise<void>;
};

const prompt = onCommandUseDiagsSelectionOrPrompt;
const tsFCfg = (configTarget: ConfigurationTarget, limitToTarget = false) =>
    targetsAndScopeFromConfigurationTarget(configTarget, undefined, undefined, limitToTarget);
const actionAddWordToFolder = prompt('Add Words to Folder Dictionary', addWordToFolderDictionary);
const actionAddWordToWorkspace = prompt('Add Words to Workspace Dictionaries', addWordToWorkspaceDictionary);
const actionAddWordToUser = prompt('Add Words to User Dictionary', addWordToUserDictionary);
const actionAddWordToFolderSettings = prompt('Add Words to Folder Settings', fnWTarget(addWordToTarget, dtVSCodeFolder));
const actionAddWordToWorkspaceSettings = prompt('Add Words to Workspace Settings', fnWTarget(addWordToTarget, dtVSCodeWorkspace));
const actionAddWordToUserSettings = prompt('Add Words to User Settings', fnWTarget(addWordToTarget, dtVSCodeUser));
const actionRemoveWordFromFolderDictionary = prompt('Remove Words from Folder Dictionary', removeWordFromFolderDictionary);
const actionRemoveWordFromWorkspaceDictionary = prompt('Remove Words from Workspace Dictionaries', removeWordFromWorkspaceDictionary);
const actionRemoveWordFromUserDictionary = prompt('Remove Words from Global Dictionary', removeWordFromUserDictionary);
const actionAddIgnoreWord = prompt('Ignore Words', fnWTarget(addIgnoreWordsToTarget, undefined));
const actionAddIgnoreWordToFolder = prompt(
    'Ignore Words in Folder Settings',
    fnWTarget(addIgnoreWordsToTarget, ConfigurationTarget.WorkspaceFolder),
);
const actionAddIgnoreWordToWorkspace = prompt(
    'Ignore Words in Workspace Settings',
    fnWTarget(addIgnoreWordsToTarget, ConfigurationTarget.Workspace),
);
const actionAddIgnoreWordToUser = prompt('Ignore Words in User Settings', fnWTarget(addIgnoreWordsToTarget, ConfigurationTarget.Global));
const actionAddWordToCSpell = prompt('Add Words to cSpell Configuration', fnWTarget(addWordToTarget, dictionaryTargetBestMatchesCSpell));
const actionAddWordToDictionary = prompt('Add Words to Dictionary', fnWTarget(addWordToTarget, dictionaryTargetBestMatches));

export const commandHandlers = {
    'cSpell.addWordToDictionary': actionAddWordToDictionary,
    'cSpell.addWordToFolderDictionary': actionAddWordToFolder,
    'cSpell.addWordToWorkspaceDictionary': actionAddWordToWorkspace,
    'cSpell.addWordToUserDictionary': actionAddWordToUser,

    'cSpell.addWordToFolderSettings': actionAddWordToFolderSettings,
    'cSpell.addWordToWorkspaceSettings': actionAddWordToWorkspaceSettings,
    'cSpell.addWordToUserSettings': actionAddWordToUserSettings,

    'cSpell.removeWordFromFolderDictionary': actionRemoveWordFromFolderDictionary,
    'cSpell.removeWordFromWorkspaceDictionary': actionRemoveWordFromWorkspaceDictionary,
    'cSpell.removeWordFromUserDictionary': actionRemoveWordFromUserDictionary,

    'cSpell.addIgnoreWord': actionAddIgnoreWord,
    'cSpell.addIgnoreWordsToFolder': actionAddIgnoreWordToFolder,
    'cSpell.addIgnoreWordsToWorkspace': actionAddIgnoreWordToWorkspace,
    'cSpell.addIgnoreWordsToUser': actionAddIgnoreWordToUser,

    'cSpell.suggestSpellingCorrections': actionSuggestSpellingCorrections,

    'cSpell.goToNextSpellingIssue': () => actionJumpToSpellingError('next', false),
    'cSpell.goToPreviousSpellingIssue': () => actionJumpToSpellingError('previous', false),
    'cSpell.goToNextSpellingIssueAndSuggest': () => actionJumpToSpellingError('next', true),
    'cSpell.goToPreviousSpellingIssueAndSuggest': () => actionJumpToSpellingError('previous', true),

    'cSpell.enableLanguage': enableLanguageIdCmd,
    'cSpell.disableLanguage': disableLanguageIdCmd,
    'cSpell.enableForGlobal': async () => setEnableSpellChecking(await tsFCfg(ConfigurationTarget.Global), true),
    'cSpell.disableForGlobal': async () => setEnableSpellChecking(await tsFCfg(ConfigurationTarget.Global), false),
    'cSpell.toggleEnableForGlobal': async () => toggleEnableSpellChecker(await tsFCfg(ConfigurationTarget.Global, true)),
    'cSpell.enableForWorkspace': async () => setEnableSpellChecking(await tsFCfg(ConfigurationTarget.Workspace), true),
    'cSpell.disableForWorkspace': async () => setEnableSpellChecking(await tsFCfg(ConfigurationTarget.Workspace), false),
    'cSpell.toggleEnableForWorkspace': async () => toggleEnableSpellChecker(await tsFCfg(ConfigurationTarget.Workspace)),
    'cSpell.toggleEnableSpellChecker': async () => toggleEnableSpellChecker(await tsFCfg(ConfigurationTarget.Global)),
    'cSpell.enableCurrentLanguage': enableCurrentLanguage,
    'cSpell.disableCurrentLanguage': disableCurrentLanguage,

    'cSpell.editText': handleApplyLsTextEdits,
    'cSpell.logPerfTimeline': dumpPerfTimeline,

    'cSpell.addWordToCSpellConfig': actionAddWordToCSpell,
    'cSpell.addIssuesToDictionary': addAllIssuesFromDocument,
    'cSpell.createCustomDictionary': createCustomDictionary,
    'cSpell.createCSpellConfig': createCSpellConfig,

    'cSpell.openFileAtLine': openFileAtLine,

    'cSpell.selectRange': handleSelectRange,
    'cSpell.fixSpellingIssue': handleFixSpellingIssue,
    'cSpell.autoFixSpellingIssues': actionAutoFixSpellingIssues,

    'cSpell.issueViewer.item.openSuggestionsForIssue': handlerResolvedLater,
    'cSpell.issueViewer.item.autoFixSpellingIssues': handlerResolvedLater,
    'cSpell.issueViewer.item.addWordToDictionary': handlerResolvedLater,
} as const satisfies CommandHandler;

type ImplementedCommandHandlers = typeof commandHandlers;
type ImplementedCommandNames = keyof ImplementedCommandHandlers;

export const knownCommands = Object.fromEntries(
    Object.keys(commandHandlers).map((key) => [key, key] as [ImplementedCommandNames, ImplementedCommandNames]),
) as Record<ImplementedCommandNames, ImplementedCommandNames>;

export function registerCommands(): Disposable[] {
    const registeredHandlers = Object.entries(commandHandlers).map(([cmd, fn]) => registerCmd(cmd, fn));
    const registeredFromServer = Object.entries(commandsFromServer).map(([cmd, fn]) => registerCmd(cmd, fn));
    return [...registeredHandlers, ...registeredFromServer];
}

function handlerResolvedLater() {}

function addWordsToConfig(words: string[], cfg: ConfigRepository) {
    return handleErrors(di.get('dictionaryHelper').addWordsToConfigRep(words, cfg), 'addWordsToConfig');
}

function addWordsToDictionaryTarget(words: string[], dictTarget: DictionaryTarget) {
    return handleErrors(di.get('dictionaryHelper').addWordToDictionary(words, dictTarget), 'addWordsToDictionaryTarget');
}

// function removeWordsFromConfig(words: string[], cfg: ConfigRepository) {
//     return handleErrors(di.get('dictionaryHelper').removeWordsFromConfigRep(words, cfg));
// }

// function removeWordsFromDictionaryTarget(words: string[], dictTarget: DictionaryTarget) {
//     return handleErrors(di.get('dictionaryHelper').removeWordFromDictionary(words, dictTarget));
// }

function dispose() {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function registerCmd(cmd: string, fn: (...args: any[]) => unknown): Disposable {
    if (fn === handlerResolvedLater) {
        return { dispose };
    }
    return commands.registerCommand(cmd, catchErrors(fn, `Register command: ${cmd}`));
}

function addAllIssuesFromDocument(): Promise<void> {
    return handleErrors(di.get('dictionaryHelper').addIssuesToDictionary(), 'addAllIssuesFromDocument');
}

function addIgnoreWordsToTarget(
    word: string,
    target: ConfigurationTarget | undefined,
    uri: string | null | Uri | undefined,
): Promise<void> {
    return handleErrors(_addIgnoreWordsToTarget(word, target, uri), ctx('addIgnoreWordsToTarget', undefined, uri));
}

async function _addIgnoreWordsToTarget(
    word: string,
    target: ConfigurationTarget | undefined,
    uri: string | null | Uri | undefined,
): Promise<void> {
    uri = toUri(uri);
    const targets = await targetsForUri(uri);
    const filteredTargets = target ? targets.filter((t) => t.scope === configurationTargetToDictionaryScope(target)) : targets;
    return Settings.addIgnoreWordsToSettings(filteredTargets, word);
}

function removeWordFromFolderDictionary(word: string, uri: string | null | Uri | undefined): Promise<void> {
    return removeWordFromTarget(word, ConfigurationTarget.WorkspaceFolder, uri);
}

function removeWordFromWorkspaceDictionary(word: string, uri: string | null | Uri | undefined): Promise<void> {
    return removeWordFromTarget(word, ConfigurationTarget.Workspace, uri);
}

function removeWordFromUserDictionary(word: string): Promise<void> {
    return removeWordFromTarget(word, ConfigurationTarget.Global, undefined);
}

function removeWordFromTarget(word: string, target: ConfigurationTarget, uri: string | null | Uri | undefined) {
    return handleErrors(_removeWordFromTarget(word, target, uri), ctx('removeWordFromTarget', target, uri));
}

function _removeWordFromTarget(word: string, cfgTarget: ConfigurationTarget, docUri: string | null | Uri | undefined) {
    docUri = toUri(docUri);
    const target = createClientConfigTargetVSCode(cfgTarget, docUri, undefined);
    return di.get('dictionaryHelper').removeWordsFromTargets(word, [target], docUri);
}

export function enableLanguageIdCmd(languageId: string, uri?: Uri | string): Promise<void> {
    return enableDisableLanguageId(languageId, toUri(uri), undefined, true);
}

export function disableLanguageIdCmd(languageId: string, uri?: string | Uri): Promise<void> {
    return enableDisableLanguageId(languageId, toUri(uri), undefined, false);
}

export function enableDisableLanguageId(
    languageId: string,
    uri: Uri | undefined,
    configTarget: ConfigurationTarget | undefined,
    enable: boolean,
): Promise<void> {
    return handleErrors(
        async () => {
            const t = await (configTarget ? targetsFromConfigurationTarget(configTarget, uri) : targetsForUri(uri));
            return Settings.enableLanguageIdForTarget(languageId, enable, t);
        },
        ctx(`enableDisableLanguageId enable: ${enable}`, configTarget, uri),
    );
}

export function enableDisableLocale(
    locale: string,
    uri: Uri | undefined,
    configTarget: ConfigurationTarget | undefined,
    configScope: ConfigurationScope | undefined,
    enable: boolean,
): Promise<void> {
    return handleErrors(
        async () => {
            const { targets, scopes } = await targetsAndScopeFromConfigurationTarget(
                configTarget || ConfigurationTarget.Global,
                uri,
                configScope,
            );
            return Settings.enableLocaleForTarget(locale, enable, targets, scopes);
        },
        ctx(`enableDisableLocale enable: ${enable}`, configTarget, uri),
    );
}

export function enableDisableLocaleLegacy(target: ConfigTargetLegacy | boolean, locale: string, enable: boolean): Promise<void> {
    const _target = typeof target === 'boolean' ? (target ? ConfigurationTarget.Global : ConfigurationTarget.Workspace) : target;
    const t = normalizeTarget(_target);
    return enableDisableLocale(locale, t.uri, t.target, t.configScope, enable);
}

export function enableCurrentLanguage(): Promise<void> {
    return handleErrors(async () => {
        const document = window.activeTextEditor?.document;
        if (!document) return;
        const targets = await targetsForTextDocument(document);
        return Settings.enableLanguageId(targets, document.languageId);
    }, 'enableCurrentLanguage');
}

export function disableCurrentLanguage(): Promise<void> {
    return handleErrors(async () => {
        const document = window.activeTextEditor?.document;
        if (!document) return;
        const targets = await targetsForTextDocument(document);
        return Settings.disableLanguageId(targets, document.languageId);
    }, 'disableCurrentLanguage');
}

async function targetsAndScopeFromConfigurationTarget(
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

async function targetsFromConfigurationTarget(
    cfgTarget: ConfigurationTarget,
    docUri?: string | null | Uri | undefined,
    configScope?: ConfigurationScope,
): Promise<ClientConfigTarget[]> {
    const r = await targetsAndScopeFromConfigurationTarget(cfgTarget, docUri, configScope);
    const { targets, scopes } = r;
    const allowedScopes = new Set(scopes);
    return targets.filter((t) => allowedScopes.has(t.scope));
}

async function targetsForTextDocument(
    document: TextDocument | { uri: Uri; languageId?: string } | undefined,
    patternMatch = patternMatchNoDictionaries,
) {
    const { uri, languageId } = document || {};
    const config = await di.get('client').getConfigurationForDocument({ uri, languageId });
    const targets = config.configTargets.map(mapConfigTargetToClientConfigTarget);
    return filterClientConfigTargets(targets, patternMatch);
}

async function targetsForUri(docUri?: string | null | Uri | undefined, patternMatch = patternMatchNoDictionaries) {
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

function ctx(method: string, target: ConfigurationTarget | undefined, uri: Uri | string | null | undefined): string {
    const scope = target ? configurationTargetToDictionaryScope(target) : '';
    return scope ? `${method} ${scope} ${toUri(uri)}` : `${method} ${toUri(uri)}`;
}

async function createCustomDictionary(): Promise<void> {
    const targets = await targetsForTextDocument(window.activeTextEditor?.document);

    const t = await quickPickTarget(targets);
    if (!t) return;
    const cfg = configTargetToConfigRepo(t);
    if (!cfg) return;
    await di.get('dictionaryHelper').createCustomDictionary(cfg);
}

function dumpPerfTimeline(): void {
    performance.getEntries().forEach((entry) => {
        console.log(entry.name, toMilliseconds(entry.startTime), entry.duration);
    });
}

async function createCSpellConfig(): Promise<void> {
    const uri = await createConfigFileRelativeToDocumentUri(window.activeTextEditor?.document.uri);
    if (uri) {
        const editor = await window.showTextDocument(uri);
        // for `package.json` files, we might need to scroll to the right position.
        scrollToText(editor, '"cspell":');
    }
}

export const __testing__ = {
    commandHandlers,
};

function nextDiags(diags: Diagnostic[], selection: Selection): Diagnostic | undefined {
    // concat next diags with the first diag to get a cycle
    return diags.filter((d) => d.range?.start.isAfter(selection.end)).concat(diags[0])[0];
}

function previousDiags(diags: Diagnostic[], selection: Selection): Diagnostic | undefined {
    // concat the last diag with all previous diags to get a cycle
    return [diags[diags.length - 1]].concat(diags.filter((d) => d.range?.end.isBefore(selection.start))).pop();
}

async function actionJumpToSpellingError(which: 'next' | 'previous', suggest: boolean) {
    const editor = window.activeTextEditor;
    if (!editor) return;
    const document = editor.document;
    const selection = editor.selection;
    const diags = document ? getCSpellDiags(document.uri) : undefined;

    const matchingDiags = diags ? (which === 'next' ? nextDiags(diags, selection) : previousDiags(diags, selection)) : undefined;
    const range = matchingDiags?.range;
    if (!document || !selection || !range || !matchingDiags) {
        return pVoid(window.showInformationMessage('No issues found in this document.'), 'actionJumpToSpellingError');
    }

    editor.revealRange(range, TextEditorRevealType.InCenterIfOutsideViewport);
    editor.selection = new Selection(range.start, range.end);

    if (suggest) {
        return actionSuggestSpellingCorrections();
    }
}

async function openFileAtLine(uri: string | Uri, line: number | undefined): Promise<void> {
    uri = toUri(uri);

    const options =
        (line && {
            selection: lineToRange(line),
        }) ||
        undefined;

    await window.showTextDocument(uri, options);
}

function lineToRange(line: number | string | undefined) {
    if (line === undefined) return undefined;
    line = typeof line === 'string' ? Number.parseInt(line) : line;
    const pos = new Position(line - 1, 0);
    const range = new Range(pos, pos);
    return range;
}

export function createTextEditCommand(
    title: string,
    uri: string | Uri,
    documentVersion: number,
    edits: LsTextEdit[] | TextEdit[],
): Command {
    const normalizedEdits: LsTextEdit[] = edits.map(toLsTextEdit);
    return {
        title,
        command: 'cSpell.editText',
        arguments: [uri.toString(), documentVersion, normalizedEdits],
    };
}

/**
 * Create a href URL that will execute a command.
 */
export function commandUri(command: Command): string;
export function commandUri(command: string, ...params: unknown[]): string;
export function commandUri(command: string | Command, ...params: unknown[]): string {
    if (typeof command === 'string') {
        return `command:${command}?${encodeURIComponent(JSON.stringify(params))}`;
    }
    return `command:${command.command}?${command.arguments ? encodeURIComponent(JSON.stringify(command.arguments)) : ''}`;
}

function toLsPosition(p: LsPosition | Position): LsPosition {
    const { line, character } = p;
    return { line, character };
}

function toLsRange(range: LsRange | Range): LsRange {
    return {
        start: toLsPosition(range.start),
        end: toLsPosition(range.end),
    };
}

function toLsTextEdit(edit: LsTextEdit | TextEdit): LsTextEdit {
    const { range, newText } = edit;
    return {
        range: toLsRange(range),
        newText,
    };
}

async function handleSelectRange(uri?: Uri, range?: Range): Promise<void> {
    if (!uri || !range) return;
    // const editor = findEditor(uri);
    // if (!editor) return;
    // editor.revealRange(range);
    // editor.selection = new Selection(range.start, range.end);
    await window.showTextDocument(uri, { selection: range });
}
