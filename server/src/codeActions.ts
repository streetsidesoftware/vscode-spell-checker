import {
    TextDocument,
    TextDocuments,
    Command,
    CodeActionParams
} from 'vscode-languageserver';
import * as LangServer from 'vscode-languageserver';
import { Text } from 'cspell';
import * as Validator from './validator';
import { CSpellUserSettings } from 'cspell';
import { SpellingDictionary } from 'cspell';
import * as cspell from 'cspell';

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


export function onCodeActionHandler(documents: TextDocuments, fnSettings: (doc: TextDocument) => Promise<CSpellUserSettings>) {

    type SettingsDictPair = [CSpellUserSettings, SpellingDictionary];
    interface CacheEntry {
        version: number;
        settings: Promise<SettingsDictPair>;
    }

    const settingsCache = new Map<string, CacheEntry>();

    async function getSettings(doc: TextDocument): Promise<[CSpellUserSettings, SpellingDictionary]> {
        const cached = settingsCache.get(doc.uri);
        if (!cached || cached.version !== doc.version) {
            settingsCache.set(doc.uri, { version: doc.version, settings: constructSettings(doc) });
        }
        return settingsCache.get(doc.uri)!.settings;
    }

    async function constructSettings(doc: TextDocument): Promise<SettingsDictPair> {
        const docSetting = cspell.constructSettingsForText(await fnSettings(doc), doc.getText(), doc.languageId);
        const dict = await cspell.getDictionary(docSetting);
        return  [docSetting, dict];
    }

    return async (params: CodeActionParams) => {
        const commands: Command[] = [];
        const { context, textDocument: { uri } } = params;
        const { diagnostics } = context;
        const textDocument = documents.get(uri);
        const [ docSetting, dictionary ] = await getSettings(textDocument);
        const { numSuggestions = defaultNumSuggestions } = docSetting;

        function replaceText(range: LangServer.Range, text?: string) {
            return LangServer.TextEdit.replace(range, text || '');
        }

        function genMultiWordSugs(word: string, words: string[]): string[] {
            const snakeCase = words.join('_').toLowerCase();
            const camelCase = Text.snakeToCamel(snakeCase);
            const sug = Text.isFirstCharacterUpper(word) ? Text.ucFirst(camelCase) : Text.lcFirst(camelCase);
            return [
                sug,
            ];
        }

        function getSuggestions(dictionary: SpellingDictionary, word: string, numSuggestions: number): string[] {
            if (word.length > maxWordLengthForSuggestions) {
                return [];
            }
            const numSugs = word.length > wordLengthForLimitingSuggestions ? maxNumberOfSuggestionsForLongWords : numSuggestions;
            const numEdits = maxEdits;
            return dictionary.suggest(word, numSugs, undefined, numEdits).map(sr => sr.word.replace(regexJoinedWords, ''));
        }

        function genSuggestions(dictionary: SpellingDictionary) {
            const spellCheckerDiags = diagnostics.filter(diag => diag.source === Validator.diagSource);
            let altWord: string | undefined;
            for (const diag of spellCheckerDiags) {
                const word = extractText(textDocument, diag.range);
                altWord = altWord || word;
                const sugs: string[] = getSuggestions(dictionary, word, numSuggestions);
                sugs
                    .map(sug => Text.matchCase(word, sug))
                    .forEach(sugWord => {
                        commands.push(LangServer.Command.create(sugWord, 'cSpell.editText',
                            uri,
                            textDocument.version,
                            [ replaceText(diag.range, sugWord) ]
                        ));
                        /*
                        // Turn of making multiple suggestions for the same words.
                        const words = sugWord.replace(/[ _.]/g, '_').split('_');
                        if (words.length > 1) {
                            if (Text.isUpperCase(word)) {
                                const sug = words.join('_').toUpperCase();
                                commands.push(LangServer.Command.create(sug, 'cSpell.editText',
                                    uri,
                                    textDocument.version,
                                    [ replaceText(diag.range, sug) ]
                                ));
                            } else {
                                genMultiWordSugs(word, words).forEach(sugWord => {
                                    commands.push(LangServer.Command.create(sugWord, 'cSpell.editText',
                                        uri,
                                        textDocument.version,
                                        [ replaceText(diag.range, sugWord) ]
                                    ));
                                });
                            }
                        }
                        */
                    });
            }
            const word = extractText(textDocument, params.range) || altWord;
            // Only suggest adding if it is our diagnostic and there is a word.
            if (word && spellCheckerDiags.length) {
                commands.push(LangServer.Command.create(
                    'Add: "' + word + '" to dictionary',
                    'cSpell.addWordToUserDictionarySilent',
                    word
                ));
                // Allow the them to add it to the project dictionary.
                commands.push(LangServer.Command.create(
                    'Add: "' + word + '" to project dictionary',
                    'cSpell.addWordToDictionarySilent',
                    word
                ));
            }
            return commands;
        }

        return genSuggestions(dictionary);
    };
}
