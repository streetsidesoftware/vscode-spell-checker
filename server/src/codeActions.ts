import {
    TextDocument,
    TextDocuments,
    Command,
    CodeActionParams
} from 'vscode-languageserver';
import * as LangServer from 'vscode-languageserver';
import { suggest } from './spellChecker';
import * as Text from './util/text';
import * as Validator from './validator';

function extractText(textDocument: TextDocument, range: LangServer.Range) {
    const { start, end } = range;
    const offStart = textDocument.offsetAt(start);
    const offEnd = textDocument.offsetAt(end);
    return textDocument.getText().slice(offStart, offEnd);
}

export function onCodeActionHandler(documents: TextDocuments, settings: CSpellPackageSettings) {
    return (params: CodeActionParams) => {
        const { numSuggestions } = settings;
        const commands: Command[] = [];
        const { context, textDocument: { uri } } = params;
        const { diagnostics } = context;
        const textDocument = documents.get(uri);

        function replaceText(range: LangServer.Range, text) {
            return LangServer.TextEdit.replace(range, text || '');
        }

        function genMultiWordSugs(words: string[]): string[] {
            const snakeCase = words.join('_').toLowerCase();
            const camelCase = Text.snakeToCamel(snakeCase);
            return [
                snakeCase,
                Text.ucFirst(camelCase),
                Text.lcFirst(camelCase)
            ];
        }

        const spellCheckerDiags = diagnostics.filter(diag => diag.source === Validator.diagSource);
        let altWord: string;
        for (const diag of spellCheckerDiags) {
            const word = extractText(textDocument, diag.range);
            altWord = altWord || word;
            const sugs: string[] = suggest(word, numSuggestions);
            sugs
                .map(sug => Text.matchCase(word, sug))
                .forEach(sugWord => {
                    commands.push(LangServer.Command.create(sugWord, 'cSpell.editText',
                        uri,
                        textDocument.version,
                        [ replaceText(diag.range, sugWord) ]
                    ));
                    const words = sugWord.replace(/[ \-_.]/, '_').split('_');
                    if (words.length > 1) {
                        if (Text.isUpperCase(word)) {
                            const sug = words.join('_').toUpperCase();
                            commands.push(LangServer.Command.create(sug, 'cSpell.editText',
                                uri,
                                textDocument.version,
                                [ replaceText(diag.range, sug) ]
                            ));
                        } else {
                            genMultiWordSugs(words).forEach(sugWord => {
                                commands.push(LangServer.Command.create(sugWord, 'cSpell.editText',
                                    uri,
                                    textDocument.version,
                                    [ replaceText(diag.range, sugWord) ]
                                ));
                            });
                        }
                    }
                });
        }
        const word = extractText(textDocument, params.range) || altWord;
        if (word !== undefined) {
            // add it to the front or it might get lost.  The is due to 1.6 changes
            // Once VS Code 1.7 is release, we can add this to the end.
            commands.unshift(LangServer.Command.create(
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
    };
}
