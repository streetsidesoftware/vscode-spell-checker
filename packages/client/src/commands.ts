import { toUri } from 'common-utils/uriHelper.js';
import { isDefined } from 'common-utils/util.js';
import {
    CodeAction,
    commands,
    Diagnostic,
    Disposable,
    FileType,
    QuickPickItem,
    Range,
    Selection,
    TextDocument,
    Uri,
    window,
    workspace,
    WorkspaceEdit,
} from 'vscode';
import { TextEdit } from 'vscode-languageclient/node';
import * as di from './di';
import { getCSpellDiags } from './diags';
import { ClientSideCommandHandlerApi, SpellCheckerSettingsProperties } from './server';
import * as Settings from './settings';
import { ConfigurationTarget, createConfigFileRelativeToDocumentUri, setEnableSpellChecking, toggleEnableSpellChecker } from './settings';
import { ClientConfigTarget } from './settings/clientConfigTarget';
import { ConfigRepository, createCSpellConfigRepository, createVSCodeConfigRepository } from './settings/configRepository';
import { configTargetToConfigRepo } from './settings/configRepositoryHelper';
import {
    createClientConfigTargetVSCode,
    dictionaryTargetBestMatch,
    dictionaryTargetBestMatchFolder,
    dictionaryTargetBestMatchUser,
    dictionaryTargetBestMatchWorkspace,
    dictionaryTargetCSpell,
    dictionaryTargetVSCodeFolder as dtVSCodeFolder,
    dictionaryTargetVSCodeUser as dtVSCodeUser,
    dictionaryTargetVSCodeWorkspace as dtVSCodeWorkspace,
    TargetBestMatchFn,
} from './settings/configTargetHelper';
import { createDictionaryTargetForFile, DictionaryTarget } from './settings/DictionaryTarget';
import { mapConfigTargetToClientConfigTarget } from './settings/mappers/configTarget';
import { mapConfigTargetLegacyToClientConfigTarget } from './settings/mappers/configTargetLegacy';
import { dictionaryScopeToConfigurationTarget } from './settings/targetAndScope';
import { catchErrors, handleErrors, handleErrorsEx, logError, onError, OnErrorHandler } from './util/errors';
import { performance, toMilliseconds } from './util/perf';

const commandsFromServer: ClientSideCommandHandlerApi = {
    'cSpell.addWordsToConfigFileFromServer': (words, _documentUri, config) => {
        return addWordsToConfig(words, createCSpellConfigRepository(toUri(config.uri), config.name));
    },
    'cSpell.addWordsToDictionaryFileFromServer': (words, _documentUri, dict) => {
        return addWordsToDictionaryTarget(words, createDictionaryTargetForFile(toUri(dict.uri), dict.name));
    },
    'cSpell.addWordsToVSCodeSettingsFromServer': (words, documentUri, target) => {
        const cfgTarget = dictionaryScopeToConfigurationTarget(target);
        const cfgRepo = createVSCodeConfigRepository(cfgTarget, toUri(documentUri));
        return addWordsToConfig(words, cfgRepo);
    },
};

type CommandHandler = {
    [key in string]: (...params: any[]) => void | Promise<void>;
};

const prompt = onCommandUseDiagsSelectionOrPrompt;
const actionAddWordToFolder = prompt('Add Word to Folder Dictionary', addWordToFolderDictionary);
const actionAddWordToWorkspace = prompt('Add Word to Workspace Dictionaries', addWordToWorkspaceDictionary);
const actionAddWordToUser = prompt('Add Word to User Dictionary', addWordToUserDictionary);
const actionAddWordToFolderSettings = prompt('Add Word to Folder Settings', fnWTarget(addWordToTarget, dtVSCodeFolder));
const actionAddWordToWorkspaceSettings = prompt('Add Word to Workspace Settings', fnWTarget(addWordToTarget, dtVSCodeWorkspace));
const actionAddWordToUserSettings = prompt('Add Word to User Settings', fnWTarget(addWordToTarget, dtVSCodeUser));
const actionRemoveWordFromFolderDictionary = prompt('Remove Word from Folder Dictionary', removeWordFromFolderDictionary);
const actionRemoveWordFromWorkspaceDictionary = prompt('Remove Word from Workspace Dictionaries', removeWordFromWorkspaceDictionary);
const actionRemoveWordFromUserDictionary = prompt('Remove Word from Global Dictionary', removeWordFromUserDictionary);
const actionAddIgnoreWord = prompt('Ignore Word', fnWTarget(addIgnoreWordToTarget, ConfigurationTarget.WorkspaceFolder));
const actionAddIgnoreWordToFolder = prompt(
    'Ignore Word in Folder Settings',
    fnWTarget(addIgnoreWordToTarget, ConfigurationTarget.WorkspaceFolder)
);
const actionAddIgnoreWordToWorkspace = prompt(
    'Ignore Word in Workspace Settings',
    fnWTarget(addIgnoreWordToTarget, ConfigurationTarget.Workspace)
);
const actionAddIgnoreWordToUser = prompt('Ignore Word in User Settings', fnWTarget(addIgnoreWordToTarget, ConfigurationTarget.Global));
const actionAddWordToCSpell = prompt('Add Word to cSpell Configuration', fnWTarget(addWordToTarget, dictionaryTargetCSpell));
const actionAddWordToDictionary = prompt('Add Word to Dictionary', fnWTarget(addWordToTarget, dictionaryTargetBestMatch));

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
    'cSpell.addIgnoreWordToFolder': actionAddIgnoreWordToFolder,
    'cSpell.addIgnoreWordToWorkspace': actionAddIgnoreWordToWorkspace,
    'cSpell.addIgnoreWordToUser': actionAddIgnoreWordToUser,

    'cSpell.suggestSpellingCorrections': actionSuggestSpellingCorrections,

    'cSpell.enableLanguage': enableLanguageIdCmd,
    'cSpell.disableLanguage': disableLanguageIdCmd,
    'cSpell.enableForGlobal': () => setEnableSpellChecking(targets(ConfigurationTarget.Global), true),
    'cSpell.disableForGlobal': () => setEnableSpellChecking(targets(ConfigurationTarget.Global), false),
    'cSpell.toggleEnableForGlobal': () => toggleEnableSpellChecker(targets(ConfigurationTarget.Global)),
    'cSpell.enableForWorkspace': () => setEnableSpellChecking(targets(ConfigurationTarget.Workspace), true),
    'cSpell.disableForWorkspace': () => setEnableSpellChecking(targets(ConfigurationTarget.Workspace), false),
    'cSpell.toggleEnableSpellChecker': () => toggleEnableSpellChecker(targets(ConfigurationTarget.Workspace)),
    'cSpell.enableCurrentLanguage': enableCurrentLanguage,
    'cSpell.disableCurrentLanguage': disableCurrentLanguage,

    'cSpell.editText': handlerApplyTextEdits(),
    'cSpell.logPerfTimeline': dumpPerfTimeline,

    'cSpell.addWordToCSpellConfig': actionAddWordToCSpell,
    'cSpell.addIssuesToDictionary': addAllIssuesFromDocument,
    'cSpell.createCustomDictionary': createCustomDictionary,
    'cSpell.createCSpellConfig': createCSpellConfig,
};

function pVoid<T>(p: Promise<T> | Thenable<T>, context: string, onErrorHandler: OnErrorHandler = onError): Promise<void> {
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
    return addWordToTarget(word, dictionaryTargetBestMatchFolder, docUri);
}

export function addWordToWorkspaceDictionary(word: string, docUri: string | null | Uri | undefined): Promise<void> {
    // eslint-disable-next-line prefer-rest-params
    console.log('addWordToWorkspaceDictionary %o', arguments);
    return addWordToTarget(word, dictionaryTargetBestMatchWorkspace, docUri);
}

export function addWordToUserDictionary(word: string): Promise<void> {
    return addWordToTarget(word, dictionaryTargetBestMatchUser, undefined);
}

function addWordToTarget(word: string, target: TargetBestMatchFn, docUri: string | null | Uri | undefined) {
    return handleErrors(_addWordToTarget(word, target, docUri), 'addWordToTarget');
}

function _addWordToTarget(word: string, target: TargetBestMatchFn, docUri: string | null | Uri | undefined) {
    docUri = toUri(docUri);
    return di.get('dictionaryHelper').addWordsToTarget(word, target, docUri);
}

function addAllIssuesFromDocument(): Promise<void> {
    return handleErrors(di.get('dictionaryHelper').addIssuesToDictionary(), 'addAllIssuesFromDocument');
}

function addIgnoreWordToTarget(word: string, target: ConfigurationTarget, uri: string | null | Uri | undefined): Promise<void> {
    return handleErrors(_addIgnoreWordToTarget(word, target, uri), ctx('addIgnoreWordToTarget', target, uri));
}

async function _addIgnoreWordToTarget(word: string, target: ConfigurationTarget, uri: string | null | Uri | undefined): Promise<void> {
    uri = toUri(uri);
    const ct = mapConfigTargetLegacyToClientConfigTarget({ target, uri });
    const targets = (await targetsForUri(uri)).filter((t) => {
        t.kind === 'cspell' || (t.kind === ct.kind && t.scope === ct.scope);
    });
    return Settings.addIgnoreWordToSettings(targets, word);
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
    return di.get('dictionaryHelper').removeWordsFromTarget(word, target, docUri);
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
    return handleErrorsEx(async () => {
        const t = configTarget ? targets(configTarget, uri) : await targetsForUri(uri);
        return enable ? Settings.enableLanguageId(t, languageId) : Settings.disableLanguageId(t, languageId);
    }, ctx(`enableDisableLanguageId enable: ${enable}`, configTarget, uri));
}

export function enableCurrentLanguage(): Promise<void> {
    return handleErrorsEx(async () => {
        const document = window.activeTextEditor?.document;
        if (!document) return;
        const targets = await targetsForTextDocument(document);
        return Settings.enableLanguageId(targets, document.languageId);
    }, 'enableCurrentLanguage');
}

export function disableCurrentLanguage(): Promise<void> {
    return handleErrorsEx(async () => {
        const document = window.activeTextEditor?.document;
        if (!document) return;
        const targets = await targetsForTextDocument(document);
        return Settings.disableLanguageId(targets, document.languageId);
    }, 'disableCurrentLanguage');
}

function targets(cfgTarget: ConfigurationTarget, docUri?: string | null | Uri | undefined): ClientConfigTarget[] {
    const uri = toUri(docUri || window.activeTextEditor?.document.uri);
    const targets: ClientConfigTarget[] = [createClientConfigTargetVSCode(cfgTarget, uri, undefined)];
    return targets;
}

async function targetsForTextDocument(document: TextDocument | { uri: Uri; languageId?: string } | undefined) {
    const { uri, languageId } = document || {};
    const config = await di.get('client').getConfigurationForDocument({ uri, languageId });
    const targets = config.configTargets.map(mapConfigTargetToClientConfigTarget);
    return targets;
}

async function targetsForUri(docUri?: string | null | Uri | undefined) {
    docUri = toUri(docUri || window.activeTextEditor?.document.uri);
    const document = docUri ? await uriToTextDocInfo(docUri) : undefined;
    return targetsForTextDocument(document);
}

async function uriToTextDocInfo(uri: Uri): Promise<{ uri: Uri; languageId?: string }> {
    const fsStat = await workspace.fs.stat(uri);
    if (fsStat.type !== FileType.File) return { uri };
    return await workspace.openTextDocument(uri);
}

function onCommandUseDiagsSelectionOrPrompt(
    prompt: string,
    fnAction: (text: string, uri: Uri | undefined) => Promise<void>
): () => Promise<void> {
    return function () {
        const document = window.activeTextEditor?.document;
        const selection = window.activeTextEditor?.selection;
        const range = selection && document?.getWordRangeAtPosition(selection.active);
        const diags = document ? getCSpellDiags(document.uri) : undefined;
        const value = extractMatchingDiagText(document, selection, diags) || (range && document?.getText(range));
        const r = value
            ? fnAction(value, document?.uri)
            : window.showInputBox({ prompt, value }).then((word) => {
                  word && fnAction(word, document && document.uri);
              });
        return Promise.resolve(r);
    };
}

function ctx(method: string, target: ConfigurationTarget | undefined, uri: Uri | string | null | undefined): string {
    return `${method} ${target} ${toUri(uri)}`;
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
        return pVoid(window.showWarningMessage('Nothing to suggest.'), 'actionSuggestSpellingCorrections', onError);
    }

    const actions = await di.get('client').requestSpellingSuggestions(document, r, matchingDiags);
    if (!actions || !actions.length) {
        return pVoid(
            window.showWarningMessage(`No Suggestions Found for ${document.getText(r)}`),
            'actionSuggestSpellingCorrections',
            logError
        );
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
    const cspellTargets = targets.filter((t) => t.kind === 'cspell');
    const t = cspellTargets[0];
    if (!t?.kind || t.kind !== 'cspell') return;

    const cfg = configTargetToConfigRepo(t);
    await di.get('dictionaryHelper').createCustomDictionary(cfg);
}

function dumpPerfTimeline(): void {
    performance.getEntries().forEach((entry) => {
        console.log(entry.name, toMilliseconds(entry.startTime), entry.duration);
    });
}

function extractMatchingDiagText(
    doc: TextDocument | undefined,
    selection: Selection | undefined,
    diags: Diagnostic[] | undefined
): string | undefined {
    if (!doc || !selection || !diags) return undefined;
    return extractMatchingDiagTexts(doc, selection, diags)?.join(' ');
}

function extractMatchingDiagTexts(
    doc: TextDocument | undefined,
    selection: Selection | undefined,
    diags: Diagnostic[] | undefined
): string[] | undefined {
    if (!doc || !diags) return undefined;
    const ranges = extractMatchingDiagRanges(doc, selection, diags);
    return ranges?.map((r) => doc.getText(r));
}

function extractMatchingDiagRanges(
    doc: TextDocument | undefined,
    selection: Selection | undefined,
    diags: Diagnostic[] | undefined
): Range[] | undefined {
    if (!doc || !diags) return undefined;
    const selText = selection && doc.getText(selection);
    const matching = diags
        .map((d) => d.range)
        .map((r) => determineWordRangeToAddToDictionaryFromSelection(selText, selection, r))
        .filter(isDefined);
    return matching;
}

/**
 * An expression that matches most word like constructions. It just needs to be close.
 * If it doesn't match, the idea is to fall back to the diagnostic selection.
 */
const regExpIsWordLike = /^[\p{L}\w.-]+$/u;

function determineWordRangeToAddToDictionaryFromSelection(
    selectedText: string | undefined,
    selection: Selection | undefined,
    diagRange: Range
): Range | undefined {
    if (!selection || selectedText === undefined || diagRange.contains(selection)) return diagRange;

    const intersect = selection.intersection(diagRange);
    if (!intersect || intersect.isEmpty) return undefined;

    // The selection is bigger than the diagRange. Did the person intend for the entire selection to
    // be included or just the diag. If the selected text is a word, then assume the entire selection
    // was wanted, otherwise use the diag range.

    return regExpIsWordLike.test(selectedText) ? selection : diagRange;
}

function fnWTarget<TT>(
    fn: (word: string, t: TT, uri: Uri | undefined) => Promise<void>,
    t: TT
): (word: string, uri: Uri | undefined) => Promise<void> {
    return (word, uri) => fn(word, t, uri);
}

function createCSpellConfig(): Promise<void> {
    return pVoid(createConfigFileRelativeToDocumentUri(window.activeTextEditor?.document.uri), 'createCSpellConfig');
}

export const __testing__ = {
    determineWordRangeToAddToDictionaryFromSelection,
    extractMatchingDiagText,
    extractMatchingDiagTexts,
    commandHandlers,
};
