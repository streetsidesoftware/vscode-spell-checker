import { TextDocuments, CodeActionParams, Range as LangServerRange, Command as LangServerCommand } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CodeAction, CodeActionKind, Diagnostic, TextEdit } from 'vscode-languageserver-types';
import * as Validator from './validator';
import { CSpellUserSettings } from './config/cspellConfig';
import { SpellingDictionary, constructSettingsForText, getDictionary, Text } from 'cspell-lib';
import { isUriAllowed } from './config/documentSettings';
import { SuggestionGenerator, GetSettingsResult } from './SuggestionsGenerator';
import { uniqueFilter } from './utils';
import { log, logDebug } from 'common-utils/log.js';
import { ClientApi } from './clientApi';
import { format } from 'util';
import { clientCommands as cc } from './commands';
import { calculateConfigTargets } from './config/configTargetsHelper';
import {
    ConfigKinds,
    ConfigScope,
    ConfigScopes,
    ConfigTarget,
    ConfigTargetCSpell,
    ConfigTargetDictionary,
    ConfigTargetVSCode,
} from './config/configTargets';
import { capitalize } from 'common-utils/util.js';

const createCommand = LangServerCommand.create;

function extractText(textDocument: TextDocument, range: LangServerRange) {
    return textDocument.getText(range);
}

const debugTargets = false;

export function onCodeActionHandler(
    documents: TextDocuments<TextDocument>,
    fnSettings: (doc: TextDocument) => Promise<CSpellUserSettings>,
    fnSettingsVersion: (doc: TextDocument) => number,
    clientApi: ClientApi
): (params: CodeActionParams) => Promise<CodeAction[]> {
    type SettingsDictPair = GetSettingsResult;
    interface CacheEntry {
        docVersion: number;
        settingsVersion: number;
        settings: Promise<SettingsDictPair>;
    }

    const sugGen = new SuggestionGenerator(getSettings);
    const settingsCache = new Map<string, CacheEntry>();

    async function getSettings(doc: TextDocument): Promise<GetSettingsResult> {
        const cached = settingsCache.get(doc.uri);
        const settingsVersion = fnSettingsVersion(doc);
        if (!cached || cached.docVersion !== doc.version || cached.settingsVersion !== settingsVersion) {
            const settings = constructSettings(doc);
            settingsCache.set(doc.uri, { docVersion: doc.version, settings, settingsVersion });
        }
        return settingsCache.get(doc.uri)!.settings;
    }

    async function constructSettings(doc: TextDocument): Promise<SettingsDictPair> {
        const settings = constructSettingsForText(await fnSettings(doc), doc.getText(), doc.languageId);
        const dictionary = await getDictionary(settings);
        return { settings, dictionary };
    }

    const handler = async (params: CodeActionParams) => {
        const actions: CodeAction[] = [];
        const {
            context,
            textDocument: { uri },
        } = params;
        const { diagnostics } = context;
        const spellCheckerDiags = diagnostics.filter((diag) => diag.source === Validator.diagSource);
        if (!spellCheckerDiags.length) return [];
        const optionalTextDocument = documents.get(uri);
        if (!optionalTextDocument) return [];
        log(`CodeAction Only: ${context.only} Num: ${diagnostics.length}`, uri);
        const textDocument = optionalTextDocument;
        const { settings: docSetting, dictionary } = await getSettings(textDocument);
        if (!isUriAllowed(uri, docSetting.allowedSchemas)) {
            log(`CodeAction Uri Not allowed: ${uri}`);
            return [];
        }
        const pWorkspaceConfig = clientApi.sendOnWorkspaceConfigForDocumentRequest({ uri });

        function replaceText(range: LangServerRange, text?: string) {
            return TextEdit.replace(range, text || '');
        }

        function getSuggestions(word: string) {
            return sugGen.genWordSuggestions(textDocument, word);
        }

        async function genCodeActionsForSuggestions(_dictionary: SpellingDictionary) {
            log('CodeAction generate suggestions');
            let diagWord: string | undefined;
            for (const diag of spellCheckerDiags) {
                const word = extractText(textDocument, diag.range);
                diagWord = diagWord || word;
                const sugs: string[] = await getSuggestions(word);
                sugs.map((sug) => (Text.isLowerCase(sug) ? Text.matchCase(word, sug) : sug))
                    .filter(uniqueFilter())
                    .forEach((sugWord) => {
                        const cmd = createCommand(sugWord, 'cSpell.editText', uri, textDocument.version, [
                            replaceText(diag.range, sugWord),
                        ]);
                        const action = createAction(cmd, [diag]);
                        /**
                         * Waiting on [Add isPreferred to the CodeAction protocol. Pull Request #489 · Microsoft/vscode-languageserver-node](https://github.com/Microsoft/vscode-languageserver-node/pull/489)
                         * Note we might want this to be a config setting incase someone has `"editor.codeActionsOnSave": { "source.fixAll": true }`
                         * if (!actions.length) {
                         *     action.isPreferred = true;
                         * }
                         */
                        actions.push(action);
                    });
            }
            const word = diagWord || extractText(textDocument, params.range);
            // Only suggest adding if it is our diagnostic and there is a word.
            if (word && spellCheckerDiags.length) {
                const wConfig = await pWorkspaceConfig;
                const targets = calculateConfigTargets(docSetting, wConfig);
                debugTargets && logTargets(targets);

                actions.push(...generateTargetActions(textDocument, spellCheckerDiags, word, targets));
            }
            return actions;
        }

        return genCodeActionsForSuggestions(dictionary);
    };

    return handler;
}

function logTargets(targets: ConfigTarget[]): void {
    logDebug(format('Config Targets %o', targets));
}

function createAction(cmd: LangServerCommand, diags: Diagnostic[] | undefined): CodeAction {
    const action = CodeAction.create(cmd.title, cmd, CodeActionKind.QuickFix);
    action.diagnostics = diags;
    return action;
}

function calcScopeText(t: ConfigTarget) {
    return t.scope !== ConfigScopes.Unknown ? ` (${capitalize(t.scope)})` : '';
}

function generateTargetActions(doc: TextDocument, spellCheckerDiags: Diagnostic[], word: string, targets: ConfigTarget[]): CodeAction[] {
    const handled = new Set<ConfigScope>();

    const filtered = targets.filter((t) => {
        if (t.kind === 'dictionary' || !handled.has(t.scope) || t.has.words) {
            handled.add(t.scope);
            return true;
        }
        return false;
    });

    function dict(t: ConfigTargetDictionary): CodeAction {
        const name = t.name;
        const uri = t.dictionaryUri;
        const scopeText = calcScopeText(t);
        return createAction(
            cc.addWordsToDictionaryFileFromServer(`Add: "${word}" to dictionary: ${t.name}${scopeText}`, [word], doc.uri, {
                name,
                uri,
            }),
            spellCheckerDiags
        );
    }

    function cspell(t: ConfigTargetCSpell): CodeAction {
        return createAction(
            cc.addWordsToConfigFileFromServer(`Add: "${word}" to config: ${t.name}`, [word], doc.uri, {
                name: t.name,
                uri: t.configUri,
            }),
            spellCheckerDiags
        );
    }

    function vscode(t: ConfigTargetVSCode): CodeAction {
        return createAction(
            cc.addWordsToVSCodeSettingsFromServer(`Add: "${word}" to ${t.scope} settings`, [word], doc.uri, t.scope),
            spellCheckerDiags
        );
    }

    const actions: CodeAction[] = filtered.map((t) => {
        switch (t.kind) {
            case ConfigKinds.Vscode:
                return vscode(t);
            case ConfigKinds.Cspell:
                return cspell(t);
            case ConfigKinds.Dictionary:
                return dict(t);
        }
    });
    return actions;
}
