import type {
    CodeAction,
    ConfigurationScope,
    Diagnostic,
    Disposable,
    Location,
    QuickPickItem,
    QuickPickOptions,
    TextDocument,
    TextEdit,
    TextEditor,
    Uri,
} from 'vscode';
import { commands, FileType, Position, Range, Selection, TextEditorRevealType, window, workspace, WorkspaceEdit } from 'vscode';
import type { TextEdit as LsTextEdit } from 'vscode-languageclient/node';

import type { ClientSideCommandHandlerApi, SpellCheckerSettingsProperties } from './client';
import * as di from './di';
import { extractMatchingDiagRanges, extractMatchingDiagTexts, getCSpellDiags } from './diags';
import { toRegExp } from './extensionRegEx/evaluateRegExp';
import { toRange } from './languageServer/clientHelpers';
import type { RangeLike } from './languageServer/models';
import type { ConfigTargetLegacy, TargetsAndScopes } from './settings';
import * as Settings from './settings';
import {
    ConfigFields,
    ConfigurationTarget,
    createConfigFileRelativeToDocumentUri,
    getSettingFromVSConfig,
    normalizeTarget,
    setEnableSpellChecking,
    toggleEnableSpellChecker,
} from './settings';
import type { ClientConfigTarget } from './settings/clientConfigTarget';
import type { ConfigRepository } from './settings/configRepository';
import { createCSpellConfigRepository, createVSCodeConfigRepository } from './settings/configRepository';
import { configTargetToConfigRepo } from './settings/configRepositoryHelper';
import type { MatchTargetsFn } from './settings/configTargetHelper';
import {
    createClientConfigTargetVSCode,
    createConfigTargetMatchPattern,
    dictionaryTargetBestMatches,
    dictionaryTargetBestMatchesCSpell,
    dictionaryTargetBestMatchesFolder,
    dictionaryTargetBestMatchesUser,
    dictionaryTargetBestMatchesVSCodeFolder as dtVSCodeFolder,
    dictionaryTargetBestMatchesVSCodeUser as dtVSCodeUser,
    dictionaryTargetBestMatchesVSCodeWorkspace as dtVSCodeWorkspace,
    dictionaryTargetBestMatchesWorkspace,
    filterClientConfigTargets,
    matchKindAll,
    matchScopeAll,
    patternMatchNoDictionaries,
    quickPickTarget,
} from './settings/configTargetHelper';
import { normalizeWords } from './settings/CSpellSettings';
import type { DictionaryTarget } from './settings/DictionaryTarget';
import { createDictionaryTargetForFile } from './settings/DictionaryTarget';
import { mapConfigTargetToClientConfigTarget } from './settings/mappers/configTarget';
import {
    configurationTargetToClientConfigScope,
    configurationTargetToClientConfigScopeInfluenceRange,
    configurationTargetToDictionaryScope,
    dictionaryScopeToConfigurationTarget,
} from './settings/targetAndScope';
import type { OnErrorResolver } from './util/errors';
import { catchErrors, handleErrors, ignoreError } from './util/errors';
import { performance, toMilliseconds } from './util/perf';
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

const commandHandlers: CommandHandler = {
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

    'cSpell.editText': handlerApplyTextEdits(),
    'cSpell.logPerfTimeline': dumpPerfTimeline,

    'cSpell.addWordToCSpellConfig': actionAddWordToCSpell,
    'cSpell.addIssuesToDictionary': addAllIssuesFromDocument,
    'cSpell.createCustomDictionary': createCustomDictionary,
    'cSpell.createCSpellConfig': createCSpellConfig,

    'cSpell.openFileAtLine': openFileAtLine,
};

function pVoid<T>(p: Promise<T> | Thenable<T>, context: string, onErrorHandler: OnErrorResolver = ignoreError): Promise<void> {
    const v = Promise.resolve(p).then(() => undefined);
    return handleErrors(v, context, onErrorHandler);
}

// function notImplemented(cmd: string) {
//     return () => pVoid(window.showErrorMessage(`Not yet implemented "${cmd}"`));
// }

const propertyFixSpellingWithRenameProvider: SpellCheckerSettingsProperties = 'fixSpellingWithRenameProvider';
const propertyUseReferenceProviderWithRename: SpellCheckerSettingsProperties = 'advanced.feature.useReferenceProviderWithRename';
const propertyUseReferenceProviderRemove: SpellCheckerSettingsProperties = 'advanced.feature.useReferenceProviderRemove';

function handlerApplyTextEdits() {
    return async function handleApplyTextEdits(uri: string, documentVersion: number, edits: LsTextEdit[]): Promise<void> {
        const client = di.get('client').client;

        const doc = workspace.textDocuments.find((doc) => doc.uri.toString() === uri);

        if (!doc) return;

        if (doc.version !== documentVersion) {
            return pVoid(
                window.showInformationMessage('Spelling changes are outdated and cannot be applied to the document.'),
                'handlerApplyTextEdits',
            );
        }

        if (edits.length === 1) {
            const cfg = workspace.getConfiguration(Settings.sectionCSpell, doc);
            if (cfg.get(propertyFixSpellingWithRenameProvider)) {
                const useReference = !!cfg.get(propertyUseReferenceProviderWithRename);
                const removeRegExp = toConfigToRegExp(cfg.get(propertyUseReferenceProviderRemove) as string | undefined);
                // console.log(`${propertyFixSpellingWithRenameProvider} Enabled`);
                const edit = client.protocol2CodeConverter.asTextEdit(edits[0]);
                if (await attemptRename(doc, edit, { useReference, removeRegExp })) {
                    return;
                }
            }
        }

        const success = await applyTextEdits(doc.uri, edits);
        return success
            ? undefined
            : pVoid(window.showErrorMessage('Failed to apply spelling changes to the document.'), 'handlerApplyTextEdits2');
    };
}

interface UseRefInfo {
    useReference: boolean;
    removeRegExp: RegExp | undefined;
}

async function attemptRename(document: TextDocument, edit: TextEdit, refInfo: UseRefInfo): Promise<boolean> {
    const { range, newText: text } = edit;
    if (range.start.line !== range.end.line) {
        return false;
    }
    const { useReference, removeRegExp } = refInfo;
    const wordRange = await findEditBounds(document, range, useReference);
    if (!wordRange || !wordRange.contains(range)) {
        return false;
    }
    const orig = wordRange.start.character;
    const a = range.start.character - orig;
    const b = range.end.character - orig;
    const docText = document.getText(wordRange);
    const fullNewText = [docText.slice(0, a), text, docText.slice(b)].join('');
    const newText = removeRegExp ? fullNewText.replace(removeRegExp, '') : fullNewText;
    try {
        const workspaceEdit = await commands
            .executeCommand('vscode.executeDocumentRenameProvider', document.uri, range.start, newText)
            .then(
                (a) => a as WorkspaceEdit | undefined,
                (reason) => (console.log(reason), false),
            );
        return !!workspaceEdit && workspaceEdit.size > 0 && (await workspace.applyEdit(workspaceEdit));
    } catch (e) {
        return false;
    }
}

async function applyTextEdits(uri: Uri, edits: LsTextEdit[]): Promise<boolean> {
    const client = di.get('client').client;
    function toTextEdit(edit: LsTextEdit): TextEdit {
        return client.protocol2CodeConverter.asTextEdit(edit);
    }

    const wsEdit = new WorkspaceEdit();
    const textEdits: TextEdit[] = edits.map(toTextEdit);
    wsEdit.set(uri, textEdits);
    try {
        return await workspace.applyEdit(wsEdit);
    } catch (e) {
        return false;
    }
}

async function findLocalReference(uri: Uri, range: Range): Promise<Location | undefined> {
    try {
        const locations = (await commands.executeCommand('vscode.executeReferenceProvider', uri, range.start)) as Location[];
        if (!Array.isArray(locations)) return undefined;
        return locations.find((loc) => loc.range.contains(range) && loc.uri.toString() === uri.toString());
    } catch (e) {
        return undefined;
    }
}

async function findEditBounds(document: TextDocument, range: Range, useReference: boolean): Promise<Range | undefined> {
    if (useReference) {
        const refLocation = await findLocalReference(document.uri, range);
        return refLocation?.range;
    }

    const wordRange = document.getWordRangeAtPosition(range.start);
    if (!wordRange || !wordRange.contains(range)) {
        return undefined;
    }
    return wordRange;
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function registerCmd(cmd: string, fn: (...args: any[]) => unknown): Disposable {
    return commands.registerCommand(cmd, catchErrors(fn, `Register command: ${cmd}`));
}

export function registerCommands(): Disposable[] {
    const registeredHandlers = Object.entries(commandHandlers).map(([cmd, fn]) => registerCmd(cmd, fn));
    const registeredFromServer = Object.entries(commandsFromServer).map(([cmd, fn]) => registerCmd(cmd, fn));
    return [...registeredHandlers, ...registeredFromServer];
}

function addWordToFolderDictionary(word: string, docUri: string | null | Uri | undefined): Promise<void> {
    return addWordToTarget(word, dictionaryTargetBestMatchesFolder, docUri);
}

export function addWordToWorkspaceDictionary(word: string, docUri: string | null | Uri | undefined): Promise<void> {
    // eslint-disable-next-line prefer-rest-params
    console.log('addWordToWorkspaceDictionary %o', arguments);
    return addWordToTarget(word, dictionaryTargetBestMatchesWorkspace, docUri);
}

export function addWordToUserDictionary(word: string): Promise<void> {
    return addWordToTarget(word, dictionaryTargetBestMatchesUser, undefined);
}

function addWordToTarget(word: string, target: MatchTargetsFn, docUri: string | null | Uri | undefined) {
    return handleErrors(_addWordToTarget(word, target, docUri), 'addWordToTarget');
}

function _addWordToTarget(word: string, target: MatchTargetsFn, docUri: string | null | Uri | undefined) {
    docUri = toUri(docUri);
    return di.get('dictionaryHelper').addWordsToTargets(word, target, docUri);
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

const compareStrings = new Intl.Collator().compare;

function onCommandUseDiagsSelectionOrPrompt(
    prompt: string,
    fnAction: (text: string, uri: Uri | undefined) => Promise<void>,
): (text?: string, uri?: Uri | string) => Promise<void> {
    return async function (text?: string, uri?: Uri | string) {
        const selected = await determineTextSelection(prompt, text, uri);
        if (!selected) return;

        const editor = window.activeTextEditor;
        await fnAction(selected.text, selected.uri);
        await (editor?.document && window.showTextDocument(editor.document));
    };
}

async function determineTextSelection(prompt: string, text?: string, uri?: Uri | string): Promise<{ text: string; uri?: Uri } | undefined> {
    uri = toUri(uri);
    if (text) {
        return { text, uri: uri || window.activeTextEditor?.document.uri };
    }

    const editor = findEditor(uri);

    const document = editor?.document;
    const selection = editor?.selection;
    const range = selection && document?.getWordRangeAtPosition(selection.active);
    const diags = document ? getCSpellDiags(document.uri) : undefined;
    const matchingDiagWords = normalizeWords(extractMatchingDiagTexts(document, selection, diags) || []);
    if (matchingDiagWords.length) {
        const picked =
            selection?.anchor.isEqual(selection.active) && matchingDiagWords.length === 1
                ? matchingDiagWords
                : await chooseWords(matchingDiagWords.sort(compareStrings), { title: prompt, placeHolder: 'Choose words' });
        if (!picked) return;
        return { text: picked.join(' '), uri: document?.uri };
    }

    if (!range || !selection || !document || !document.getText(range)) {
        const word = await window.showInputBox({ title: prompt, prompt });
        if (!word) return;
        return { text: word, uri: document?.uri };
    }

    text = selection.contains(range) ? document.getText(selection) : document.getText(range);

    const words = normalizeWords(text);
    const picked =
        words.length > 1
            ? await chooseWords(words.sort(compareStrings), { title: prompt, placeHolder: 'Choose words' })
            : [await window.showInputBox({ title: prompt, prompt, value: words[0] })];
    if (!picked) return;
    return { text: picked.join(' '), uri: document.uri };
}

async function chooseWords(words: string[], options: QuickPickOptions): Promise<string[] | undefined> {
    if (words.length <= 1) {
        const picked = await window.showInputBox({ ...options, value: words[0] });
        if (!picked) return;
        return [picked];
    }

    const items = words.map((label) => ({ label, picked: true }));

    const picked = await window.showQuickPick(items, { ...options, canPickMany: true });
    return picked?.map((p) => p.label);
}

function ctx(method: string, target: ConfigurationTarget | undefined, uri: Uri | string | null | undefined): string {
    const scope = target ? configurationTargetToDictionaryScope(target) : '';
    return scope ? `${method} ${scope} ${toUri(uri)}` : `${method} ${toUri(uri)}`;
}

interface SuggestionQuickPickItem extends QuickPickItem {
    _action: CodeAction;
}

async function actionSuggestSpellingCorrections(docUri?: Uri, rangeLike?: RangeLike, _text?: string): Promise<void> {
    // console.log('Args: %o', { docUri, range: rangeLike, _text });
    const editor = findEditor(docUri);
    const document = editor?.document;
    const selection = editor?.selection;
    const range = (rangeLike && toRange(rangeLike)) || (selection && document?.getWordRangeAtPosition(selection.active));
    const diags = document ? getCSpellDiags(document.uri) : undefined;
    const matchingRanges = extractMatchingDiagRanges(document, selection, diags);
    const r = matchingRanges?.[0] || range;
    const matchingDiags = r && diags?.filter((d) => !!d.range.intersection(r));

    if (!document || !selection || !r || !matchingDiags) {
        return pVoid(window.showInformationMessage('Nothing to suggest.'), 'actionSuggestSpellingCorrections');
    }

    const menu = getSettingFromVSConfig(ConfigFields.suggestionMenuType, document);
    if (menu === 'quickFix') {
        return await commands.executeCommand('editor.action.quickFix');
    }

    const actions = await di.get('client').requestSpellingSuggestions(document, r, matchingDiags);
    if (!actions || !actions.length) {
        return pVoid(window.showInformationMessage(`No Suggestions Found for ${document.getText(r)}`), 'actionSuggestSpellingCorrections');
    }

    const items: SuggestionQuickPickItem[] = actions.map((a) => ({ label: a.title, _action: a }));
    const picked = await window.showQuickPick(items);
    if (picked && picked._action.command) {
        const { command: cmd, arguments: args = [] } = picked._action.command;
        commands.executeCommand(cmd, ...args);
    }
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

function fnWTarget<TT>(
    fn: (word: string, t: TT, uri: Uri | undefined) => Promise<void>,
    t: TT,
): (word: string, uri: Uri | undefined) => Promise<void> {
    return (word, uri) => fn(word, t, uri);
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

function toConfigToRegExp(regExStr: string | undefined, flags = 'g'): RegExp | undefined {
    if (!regExStr) return undefined;
    try {
        return toRegExp(regExStr, flags);
    } catch (e) {
        console.log('Invalid Regular Expression: %s', regExStr);
    }
    return undefined;
}

function findEditor(uri?: Uri): TextEditor | undefined {
    if (!uri) return window.activeTextEditor;

    const uriStr = uri.toString();

    for (const editor of window.visibleTextEditors) {
        if (editor.document.uri.toString() === uriStr) {
            return editor;
        }
    }

    return undefined;
}
