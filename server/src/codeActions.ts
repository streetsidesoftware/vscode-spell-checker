import {
    TextDocument,
    TextDocuments,
    Command,
    CodeActionParams
} from 'vscode-languageserver';
import * as LangServer from 'vscode-languageserver';
import { suggest } from './spellChecker';
import * as Text from './util/text';

function extractText(textDocument: TextDocument, range: LangServer.Range) {
    const { start, end } = range;
    const offStart = textDocument.offsetAt(start);
    const offEnd = textDocument.offsetAt(end);
    return textDocument.getText().slice(offStart, offEnd);
}

export function onCodeActionHandler(documents: TextDocuments, settings: CSpellPackageSettings) {
    return (params: CodeActionParams) => {
        const { numSuggestions } = settings;
        // const startTime = Date.now();
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

        for (const diag of diagnostics) {
            const word = extractText(textDocument, diag.range);
            const sugs: string[] = suggest(word, numSuggestions);
            sugs
                .map(sug => Text.matchCase(word, sug))
                .forEach(sugWord => {
                    commands.unshift(LangServer.Command.create(sugWord, 'cSpell.editText',
                        uri,
                        textDocument.version,
                        [ replaceText(diag.range, sugWord) ]
                    ));
                    const words = sugWord.replace(/[ \-_.]/, '_').split('_');
                    if (words.length > 1) {
                        if (Text.isUpperCase(word)) {
                            const sug = words.join('_').toUpperCase();
                            commands.unshift(LangServer.Command.create(sug, 'cSpell.editText',
                                uri,
                                textDocument.version,
                                [ replaceText(diag.range, sug) ]
                            ));
                        } else {
                            genMultiWordSugs(words).forEach(sugWord => {
                                commands.unshift(LangServer.Command.create(sugWord, 'cSpell.editText',
                                    uri,
                                    textDocument.version,
                                    [ replaceText(diag.range, sugWord) ]
                                ));
                            });
                        }
                    }
                });
        }
        /*
        commands.push(LangServer.Command.create(
            'Add: ' + extractText(textDocument, params.range) + ' to dictionary',
            'cSpell.editText',
            uri,
            textDocument.version,
            [ replaceText(params.range, 'WORD') ]
        ));
        const diffTime = Date.now() - startTime;
        connection.console.log(`Suggestions Calculated in : ${diffTime}ms`);
        */
        return commands;
    };
}
