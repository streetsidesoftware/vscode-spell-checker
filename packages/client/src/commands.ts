import {
    CodeAction,
    commands,
    ConfigurationScope,
    Diagnostic,
    Disposable,
    FileType,
    Position,
    QuickPickItem,
    QuickPickOptions,
    Range,
    Selection,
    TextDocument,
    TextEditorRevealType,
    Uri,
    window,
    workspace,
    WorkspaceEdit,
} from 'vscode';
import { TextEdit } from 'vscode-languageclient/node';
import { ClientSideCommandHandlerApi, SpellCheckerSettingsProperties } from './client';
import * as di from './di';
import { extractMatchingDiagRanges, extractMatchingDiagTexts, getCSpellDiags } from './diags';
import * as Settings from './settings';
import {
    ConfigFields,
    ConfigTargetLegacy,
    ConfigurationTarget,
    createConfigFileRelativeToDocumentUri,
    getSettingFromVSConfig,
    normalizeTarget,
    setEnableSpellChecking,
    TargetsAndScopes,
    toggleEnableSpellChecker,
} from './settings';
import { ClientConfigTarget } from './settings/clientConfigTarget';
import { ConfigRepository, createCSpellConfigRepository, createVSCodeConfigRepository } from './settings/configRepository';
import { configTargetToConfigRepo } from './settings/configRepositoryHelper';
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
    MatchTargetsFn,
    patternMatchNoDictionaries,
    quickPickTarget,
} from './settings/configTargetHelper';
import { normalizeWords } from './settings/CSpellSettings';
import { createDictionaryTargetForFile, DictionaryTarget } from './settings/DictionaryTarget';
import { mapConfigTargetToClientConfigTarget } from './settings/mappers/configTarget';
import {
    configurationTargetToClientConfigScope,
    configurationTargetToClientConfigScopeInfluenceRange,
    configurationTargetToDictionaryScope,
    dictionaryScopeToConfigurationTarget,
} from './settings/targetAndScope';
import { catchErrors, handleErrors, ignoreError, OnErrorResolver } from './util/errors';
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
    fnWTarget(addIgnoreWordsToTarget, ConfigurationTarget.WorkspaceFolder)
);
const actionAddIgnoreWordToWorkspace = prompt(
    'Ignore Words in Workspace Settings',
    fnWTarget(addIgnoreWordsToTarget, ConfigurationTarget.Workspace)
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
    const v = Promise.resolve(p).then(() => {});
    return handleErrors(v, context, onErrorHandler);
}

// function notImplemented(cmd: string) {
//     return () => pVoid(window.showErrorMessage(`Not yet implemented "${cmd}"`));
// }

const propertyFixSpellingWithRenameProvider: SpellCheckerSettingsProperties = 'fixSpellingWithRenameProvider';

function handlerApplyTextEdits() {
    return async function applyTextEdits(uri: string, documentVersion: number, edits: TextEdit[]): Promise<void> {
        const client = di.get('client').client;
        const textEditor = window.activeTextEditor;
        if (!textEditor || textEditor.document.uri.toString() !== uri) return;

        if (textEditor.document.version !== documentVersion) {
            return pVoid(
                window.showInformationMessage('Spelling changes are outdated and cannot be applied to the document.'),
                'handlerApplyTextEdits'
            );
        }

        const cfg = workspace.getConfiguration(Settings.sectionCSpell, textEditor.document);
        if (cfg.get(propertyFixSpellingWithRenameProvider) && edits.length === 1) {
            console.log(`${propertyFixSpellingWithRenameProvider} Enabled`);
            const edit = edits[0];
            const range = client.protocol2CodeConverter.asRange(edit.range);
            if (await attemptRename(textEditor.document, range, edit.newText)) {
                return;
            }
        }

        return textEditor
            .edit((mutator) => {
                for (const edit of edits) {
                    mutator.replace(client.protocol2CodeConverter.asRange(edit.range), edit.newText);
                }
            })
            .then((success) =>
                success
                    ? undefined
                    : pVoid(window.showErrorMessage('Failed to apply spelling changes to the document.'), 'handlerApplyTextEdits2')
            );
    };
}

async function attemptRename(document: TextDocument, range: Range, text: string): Promise<boolean> {
    if (range.start.line !== range.end.line) {
        return false;
    }
    const wordRange = document.getWordRangeAtPosition(range.start);
    if (!wordRange || !wordRange.contains(range)) {
        return false;
    }
    const orig = wordRange.start.character;
    const a = range.start.character - orig;
    const b = range.end.character - orig;
    const docText = document.getText(wordRange);
    const newText = [docText.slice(0, a), text, docText.slice(b)].join('');
    try {
        const workspaceEdit = await commands
            .executeCommand('vscode.executeDocumentRenameProvider', document.uri, range.start, newText)
            .then(
                (a) => a as WorkspaceEdit | undefined,
                (reason) => (console.log(reason), false)
            );
        return !!workspaceEdit && workspaceEdit.size > 0 && (await workspace.applyEdit(workspaceEdit));
    } catch (e) {
        return false;
    }
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

function registerCmd(cmd: string, fn: (...args: any[]) => any): Disposable {
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
    uri: string | null | Uri | undefined
): Promise<void> {
    return handleErrors(_addIgnoreWordsToTarget(word, target, uri), ctx('addIgnoreWordsToTarget', undefined, uri));
}

async function _addIgnoreWordsToTarget(
    word: string,
    target: ConfigurationTarget | undefined,
    uri: string | null | Uri | undefined
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
    enable: boolean
): Promise<void> {
    return handleErrors(async () => {
        const t = await (configTarget ? targetsFromConfigurationTarget(configTarget, uri) : targetsForUri(uri));
        return Settings.enableLanguageIdForTarget(languageId, enable, t);
    }, ctx(`enableDisableLanguageId enable: ${enable}`, configTarget, uri));
}

export function enableDisableLocale(
    locale: string,
    uri: Uri | undefined,
    configTarget: ConfigurationTarget | undefined,
    configScope: ConfigurationScope | undefined,
    enable: boolean
): Promise<void> {
    return handleErrors(async () => {
        const { targets, scopes } = await targetsAndScopeFromConfigurationTarget(
            configTarget || ConfigurationTarget.Global,
            uri,
            configScope
        );
        return Settings.enableLocaleForTarget(locale, enable, targets, scopes);
    }, ctx(`enableDisableLocale enable: ${enable}`, configTarget, uri));
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
    cfgTargetIsExact?: boolean
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
    configScope?: ConfigurationScope
): Promise<ClientConfigTarget[]> {
    const r = await targetsAndScopeFromConfigurationTarget(cfgTarget, docUri, configScope);
    const { targets, scopes } = r;
    const allowedScopes = new Set(scopes);
    return targets.filter((t) => allowedScopes.has(t.scope));
}

async function targetsForTextDocument(
    document: TextDocument | { uri: Uri; languageId?: string } | undefined,
    patternMatch = patternMatchNoDictionaries
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
    fnAction: (text: string, uri: Uri | undefined) => Promise<void>
): () => Promise<void> {
    return async function () {
        const document = window.activeTextEditor?.document;
        const selection = window.activeTextEditor?.selection;
        const range = selection && document?.getWordRangeAtPosition(selection.active);
        const diags = document ? getCSpellDiags(document.uri) : undefined;
        const matchingDiagWords = normalizeWords(extractMatchingDiagTexts(document, selection, diags) || []);
        if (matchingDiagWords.length) {
            const picked =
                selection?.anchor.isEqual(selection.active) && matchingDiagWords.length === 1
                    ? matchingDiagWords
                    : await chooseWords(matchingDiagWords.sort(compareStrings), { title: prompt, placeHolder: 'Choose words' });
            if (!picked) return;
            return fnAction(picked.join(' '), document?.uri);
        }

        if (!range || !selection || !document || !document.getText(range)) {
            const word = await window.showInputBox({ title: prompt, prompt });
            if (!word) return;
            return fnAction(word, document?.uri);
        }

        const text = selection.contains(range) ? document.getText(selection) : document.getText(range);
        const words = normalizeWords(text);
        const picked =
            words.length > 1
                ? await chooseWords(words.sort(compareStrings), { title: prompt, placeHolder: 'Choose words' })
                : [await window.showInputBox({ title: prompt, prompt, value: words[0] })];
        if (!picked) return;
        return fnAction(picked.join(' '), document?.uri);
    };
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

async function actionSuggestSpellingCorrections(): Promise<void> {
    const document = window.activeTextEditor?.document;
    const selection = window.activeTextEditor?.selection;
    const range = selection && document?.getWordRangeAtPosition(selection.active);
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
    t: TT
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
