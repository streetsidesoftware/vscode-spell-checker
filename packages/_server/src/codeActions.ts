import {
    TextDocument,
    TextDocuments,
    CodeActionParams,
} from 'vscode-languageserver';
import {
    CodeAction,
} from 'vscode-languageserver-types';
import * as LangServer from 'vscode-languageserver';
import { Text } from 'cspell';
import * as Validator from './validator';
import { CSpellUserSettings } from './cspellConfig';
import { SpellingDictionary } from 'cspell';
import * as cspell from 'cspell';
import { CompoundWordsMethod } from 'cspell-trie/dist/lib/walker';
import { isUriAllowed, DocumentSettings } from './documentSettings';
// import { SuggestionGenerator } from './SuggestionsGenerator';

const defaultNumSuggestions = 10;

const regexJoinedWords = /[+]/g;

const maxWordLengthForSuggestions = 20;
const wordLengthForLimitingSuggestions = 15;
const maxNumberOfSuggestionsForLongWords = 1;
const maxEdits = 3;

function extractText(textDocument: TextDocument, range: LangServer.Range) {
    const { start, end } = range;
    const offStart = textDocument.offsetAt(start);
    const offEnd = textDocument.offsetAt(end);
    return textDocument.getText().slice(offStart, offEnd);
}


export function onCodeActionHandler(
    documents: TextDocuments,
    fnSettings: (doc: TextDocument) => Promise<CSpellUserSettings>,
    fnSettingsVersion: (doc: TextDocument) => number,
    documentSettings: DocumentSettings,
): (params: CodeActionParams) => Promise<CodeAction[]> {
    type SettingsDictPair = [CSpellUserSettings, SpellingDictionary];
    interface CacheEntry {
        docVersion: number;
        settingsVersion: number;
        settings: Promise<SettingsDictPair>;
    }

    const settingsCache = new Map<string, CacheEntry>();

    async function getSettings(doc: TextDocument): Promise<[CSpellUserSettings, SpellingDictionary]> {
        const cached = settingsCache.get(doc.uri);
        const settingsVersion = fnSettingsVersion(doc);
        if (!cached || cached.docVersion !== doc.version || cached.settingsVersion !== settingsVersion) {
            const settings = constructSettings(doc);
            settingsCache.set(doc.uri, { docVersion: doc.version, settings, settingsVersion });
        }
        return settingsCache.get(doc.uri)!.settings;
    }

    async function constructSettings(doc: TextDocument): Promise<SettingsDictPair> {
        const docSetting = cspell.constructSettingsForText(await fnSettings(doc), doc.getText(), doc.languageId);
        const dict = await cspell.getDictionary(docSetting);
        return  [docSetting, dict];
    }

    const handler = async (params: CodeActionParams) => {
        const actions: CodeAction[] = [];
        const { context, textDocument: { uri } } = params;

        const { diagnostics } = context;
        const optionalTextDocument = documents.get(uri);
        if (!optionalTextDocument) return [];
        const textDocument = optionalTextDocument;
        const [ docSetting, dictionary ] = await getSettings(textDocument);
        if (!isUriAllowed(uri, docSetting.allowedSchemas)) {
            return [];
        }
        const { numSuggestions = defaultNumSuggestions } = docSetting;
        const folders = await documentSettings.folders;
        const showAddToWorkspace = folders && folders.length > 1;
        const showAddToFolder = folders && folders.length > 0;

        function replaceText(range: LangServer.Range, text?: string) {
            return LangServer.TextEdit.replace(range, text || '');
        }

        function getSuggestions(dictionary: SpellingDictionary, word: string, numSuggestions: number): string[] {
            if (word.length > maxWordLengthForSuggestions) {
                return [];
            }
            const numSugs = word.length > wordLengthForLimitingSuggestions ? maxNumberOfSuggestionsForLongWords : numSuggestions;
            const numEdits = maxEdits;
            // Turn off compound suggestions for now until it works a bit better.
            return dictionary.suggest(word, numSugs, CompoundWordsMethod.NONE, numEdits).map(sr => sr.word.replace(regexJoinedWords, ''));
        }

        function createAction(title: string, command: string, diags: LangServer.Diagnostic[] | undefined, ...args: any[]): CodeAction {
            const cmd = LangServer.Command.create(
                title,
                command,
                ...args
            );
            const action = LangServer.CodeAction.create(title, cmd);
            action.diagnostics = diags;
            action.kind = LangServer.CodeActionKind.QuickFix;
            return action;
        }

        function genCodeActionsForSuggestions(dictionary: SpellingDictionary) {
            const spellCheckerDiags = diagnostics.filter(diag => diag.source === Validator.diagSource);
            let diagWord: string | undefined;
            for (const diag of spellCheckerDiags) {
                const word = extractText(textDocument, diag.range);
                diagWord = diagWord || word;
                const sugs: string[] = getSuggestions(dictionary, word, numSuggestions);
                sugs
                    .map(sug => Text.matchCase(word, sug))
                    .forEach(sugWord => {
                        const action = createAction(
                            sugWord,
                            'cSpell.editText',
                            [diag],
                            uri,
                            textDocument.version,
                            [ replaceText(diag.range, sugWord) ]
                        );
                        // Waiting on [Add isPreferred to the CodeAction protocol. Pull Request #489 · Microsoft/vscode-languageserver-node](https://github.com/Microsoft/vscode-languageserver-node/pull/489)
                        // if (!actions.length) {
                        //     action.isPreferred = true;
                        // }
                        actions.push(action);
                    });
            }
            const word = diagWord || extractText(textDocument, params.range);
            // Only suggest adding if it is our diagnostic and there is a word.
            if (word && spellCheckerDiags.length) {
                actions.push(createAction(
                    'Add: "' + word + '" to user dictionary',
                    'cSpell.addWordToUserDictionarySilent',
                    spellCheckerDiags,
                    word,
                    textDocument.uri
                ));
                if (showAddToFolder) {
                    // Allow the them to add it to the project dictionary.
                    actions.push(createAction(
                        'Add: "' + word + '" to folder dictionary',
                        'cSpell.addWordToDictionarySilent',
                        spellCheckerDiags,
                        word,
                        textDocument.uri
                    ));
                }
                if (showAddToWorkspace) {
                    // Allow the them to add it to the workspace dictionary.
                    actions.push(createAction(
                        'Add: "' + word + '" to workspace dictionary',
                        'cSpell.addWordToWorkspaceDictionarySilent',
                        spellCheckerDiags,
                        word,
                        textDocument.uri
                    ));
                }
            }
            return actions;
        }

        return genCodeActionsForSuggestions(dictionary);
    };

    return handler;
}
