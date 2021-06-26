import { TextDocuments, CodeActionParams, Range as LangServerRange, Command as LangServerCommand } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CodeAction, CodeActionKind, Diagnostic, TextEdit } from 'vscode-languageserver-types';
import * as Validator from './validator';
import { CSpellUserSettings } from './config/cspellConfig';
import {
    SpellingDictionary,
    constructSettingsForText,
    getDictionary,
    Text,
    DictionaryDefinitionCustom,
    CustomDictionaryScope,
} from 'cspell-lib';
import { isUriAllowed, DocumentSettings } from './config/documentSettings';
import { SuggestionGenerator, GetSettingsResult } from './SuggestionsGenerator';
import { isDefined, uniqueFilter } from './utils';
import { log, logDebug } from './utils/log';
import { ClientApi } from './clientApi';
import { format } from 'util';
import { URI } from 'vscode-uri';
import { clientCommands } from './commands';

const createCommand = LangServerCommand.create;

function extractText(textDocument: TextDocument, range: LangServerRange) {
    return textDocument.getText(range);
}

export function onCodeActionHandler(
    documents: TextDocuments<TextDocument>,
    fnSettings: (doc: TextDocument) => Promise<CSpellUserSettings>,
    fnSettingsVersion: (doc: TextDocument) => number,
    documentSettings: DocumentSettings,
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
        const folders = await documentSettings.folders;
        const pWorkspaceConfig = clientApi.sendOnWorkspaceConfigForDocumentRequest({ uri });

        function replaceText(range: LangServerRange, text?: string) {
            return TextEdit.replace(range, text || '');
        }

        function getSuggestions(word: string) {
            return sugGen.genWordSuggestions(textDocument, word);
        }

        function createAction(cmd: LangServerCommand, diags: Diagnostic[] | undefined): CodeAction {
            const action = CodeAction.create(cmd.title, cmd, CodeActionKind.QuickFix);
            action.diagnostics = diags;
            return action;
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
            const wConfig = await pWorkspaceConfig;
            const sources = documentSettings.extractCSpellFileConfigurations(docSetting);
            const dictionaries = sortDictionariesForDisplay(documentSettings.extractTargetDictionaries(docSetting));
            const sourceFiles = sources
                .map((s) => ({ ...s.source, hasWords: !!s.words?.length }))
                .map(({ name, filename, hasWords }) => ({ name, filename, uri: URI.file(filename), hasWords }));
            const scopes = aggregateDictionaryScopes(dictionaries);
            const showAddToUser = !!(!scopes.user || wConfig.words.user);
            const showAddToWorkspace = (!scopes.workspace || wConfig.words.workspace) && folders?.length > 0;
            const showAddToFolder = (!scopes.folder || wConfig.words.folder) && !!wConfig.workspaceFile && folders?.length > 1;
            const configsWithDicts = extractDictionarySources(dictionaries);

            logDebug(format('Config %o', wConfig));
            logDebug(format('Sources %o', sources));
            logDebug(format('Dictionaries %o', dictionaries));
            const word = diagWord || extractText(textDocument, params.range);
            // Only suggest adding if it is our diagnostic and there is a word.
            if (word && spellCheckerDiags.length) {
                dictionaries.forEach((dict) => {
                    const name = dict.name;
                    const uri = URI.file(dict.path).toString();
                    const scopeText = calcScopeText(dict);
                    actions.push(
                        createAction(
                            clientCommands.addWordsToDictionaryFile(
                                `Add: "${word}" to dictionary: ${dict.name}${scopeText}`,
                                [word],
                                textDocument.uri,
                                { name, uri }
                            ),
                            spellCheckerDiags
                        )
                    );
                });
                sourceFiles.forEach((src) => {
                    const name = src.name;
                    const uri = src.uri.toString();
                    if (!configsWithDicts.has(uri)) {
                        actions.push(
                            createAction(
                                clientCommands.addWordsToConfigFile(`Add: "${word}" to config: ${src.name}`, [word], textDocument.uri, {
                                    name,
                                    uri,
                                }),
                                spellCheckerDiags
                            )
                        );
                    }
                });
                if (showAddToUser) {
                    actions.push(
                        createAction(
                            clientCommands.addWordsToVSCodeSettings(`Add: "${word}" to user settings`, [word], textDocument.uri, 'user'),
                            spellCheckerDiags
                        )
                    );
                }
                if (showAddToFolder && (wConfig.words.folder || !sourceFiles.length)) {
                    // Allow the them to add it to the project dictionary.
                    actions.push(
                        createAction(
                            clientCommands.addWordsToVSCodeSettings(
                                `Add: "${word}" to folder settings`,
                                [word],
                                textDocument.uri,
                                'folder'
                            ),
                            spellCheckerDiags
                        )
                    );
                }
                if (showAddToWorkspace && (wConfig.words.workspace || !sourceFiles.length)) {
                    // Allow the them to add it to the workspace dictionary.
                    actions.push(
                        createAction(
                            clientCommands.addWordsToVSCodeSettings(
                                `Add: "${word}" to workspace settings`,
                                [word],
                                textDocument.uri,
                                'workspace'
                            ),
                            spellCheckerDiags
                        )
                    );
                }
            }
            return actions;
        }

        return genCodeActionsForSuggestions(dictionary);
    };

    return handler;
}

function calcScopeText(dict: DictionaryDefinitionCustom) {
    const scope = getScopes(dict);
    if (!scope.length) return '';

    const t = scope.join(', ');
    return t ? ` [${t}]` : '';
}

function getScopes(dict: DictionaryDefinitionCustom): CustomDictionaryScope[] {
    const { scope } = dict;

    return !scope ? [] : typeof scope === 'string' ? [scope] : scope;
}

type DictionaryScopesFound = {
    [scope in CustomDictionaryScope]: boolean;
};

function aggregateDictionaryScopes(dicts: DictionaryDefinitionCustom[]): DictionaryScopesFound {
    const f: DictionaryScopesFound = {
        user: false,
        workspace: false,
        folder: false,
    };
    for (const dict of dicts) {
        const scopes = getScopes(dict);
        scopes.forEach((s) => (f[s] = true));
    }
    return f;
}

const scopeScore: { [scope in CustomDictionaryScope]: number } = {
    user: -1,
    workspace: 4,
    folder: 2,
};

// order is workspace folder `none` user
function sortDictionariesForDisplay(dicts: DictionaryDefinitionCustom[]): DictionaryDefinitionCustom[] {
    function score(dict: DictionaryDefinitionCustom): number {
        let score = 1;
        for (const s of getScopes(dict)) {
            score += scopeScore[s] || 0;
        }
        return score;
    }

    const d = dicts.map((dict) => ({ dict, score: score(dict) })).sort((a, b) => b.score - a.score);
    return d.map((dd) => dd.dict);
}

type UriString = string;

interface DictWithSource extends DictionaryDefinitionCustom {
    __source?: string;
}

function extractDictionarySources(dicts: DictWithSource[]): Set<UriString> {
    const found = new Set(
        dicts
            .map((d) => d.__source)
            .filter(isDefined)
            .map((f) => URI.file(f).toString())
    );
    return found;
}
