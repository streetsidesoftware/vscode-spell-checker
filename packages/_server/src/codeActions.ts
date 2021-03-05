import { TextDocuments, CodeActionParams, Range as LangServerRange, Command as LangServerCommand } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CodeAction, CodeActionKind, Diagnostic, TextEdit } from 'vscode-languageserver-types';
import * as Validator from './validator';
import { CSpellUserSettings } from './config/cspellConfig';
import { SpellingDictionary, constructSettingsForText, getDictionary, Text } from 'cspell-lib';
import { isUriAllowed, DocumentSettings } from './config/documentSettings';
import { SuggestionGenerator, GetSettingsResult } from './SuggestionsGenerator';
import { uniqueFilter } from './utils';
import { log } from './utils/log';

function extractText(textDocument: TextDocument, range: LangServerRange) {
    return textDocument.getText(range);
}

export function onCodeActionHandler(
    documents: TextDocuments<TextDocument>,
    fnSettings: (doc: TextDocument) => Promise<CSpellUserSettings>,
    fnSettingsVersion: (doc: TextDocument) => number,
    documentSettings: DocumentSettings
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
        const showAddToWorkspace = folders && folders.length > 0;
        const showAddToFolder = folders && folders.length > 1;

        function replaceText(range: LangServerRange, text?: string) {
            return TextEdit.replace(range, text || '');
        }

        function getSuggestions(word: string) {
            return sugGen.genWordSuggestions(textDocument, word);
        }

        function createAction(title: string, command: string, diags: Diagnostic[] | undefined, ...args: any[]): CodeAction {
            const cmd = LangServerCommand.create(title, command, ...args);
            const action = CodeAction.create(title, cmd);
            action.diagnostics = diags;
            action.kind = CodeActionKind.QuickFix;
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
                        const action = createAction(sugWord, 'cSpell.editText', [diag], uri, textDocument.version, [
                            replaceText(diag.range, sugWord),
                        ]);
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
                actions.push(
                    createAction(
                        'Add: "' + word + '" to user dictionary',
                        'cSpell.addWordToUserDictionarySilent',
                        spellCheckerDiags,
                        word,
                        textDocument.uri
                    )
                );
                if (showAddToFolder) {
                    // Allow the them to add it to the project dictionary.
                    actions.push(
                        createAction(
                            'Add: "' + word + '" to folder dictionary',
                            'cSpell.addWordToDictionarySilent',
                            spellCheckerDiags,
                            word,
                            textDocument.uri
                        )
                    );
                }
                if (showAddToWorkspace) {
                    // Allow the them to add it to the workspace dictionary.
                    actions.push(
                        createAction(
                            'Add: "' + word + '" to workspace dictionary',
                            'cSpell.addWordToWorkspaceDictionarySilent',
                            spellCheckerDiags,
                            word,
                            textDocument.uri
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
