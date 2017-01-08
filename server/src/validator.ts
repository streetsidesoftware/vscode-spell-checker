import {
    TextDocument, Diagnostic, DiagnosticSeverity,
} from 'vscode-languageserver';
import { onDictionaryReady } from './spellChecker';
import * as Text from './util/text';
import * as Rx from 'rx';
import * as tds from './TextDocumentSettings';

export const diagSource = 'cSpell Checker';

import { CSpellUserSettings } from './CSpellSettingsDef';
import * as TV from './textValidator';

export function validateTextDocument(textDocument: TextDocument, options: CSpellUserSettings): Rx.Promise<Diagnostic[]> {
    return validateTextDocumentAsync(textDocument, options)
        .toArray()
        .toPromise();
}

export function validateText(text: string, languageId: string, options: CSpellUserSettings): Promise<Text.WordOffset[]> {
    const settings = tds.getSettings(options, text, languageId);
    const dict = tds.getDictionary(settings);
    return dict.then(dict => [...TV.validateText(text, dict, settings)]);
}


export function validateTextDocumentAsync(textDocument: TextDocument, options: CSpellUserSettings): Rx.Observable<Diagnostic> {
    return Rx.Observable.fromPromise(validateText(textDocument.getText(), textDocument.languageId, options))
        .flatMap(a => a)
        .filter(a => !!a)
        .map(a => a!)
        // Convert the offset into a position
        .map(offsetWord => ({...offsetWord, position: textDocument.positionAt(offsetWord.offset) }))
        // Calculate the range
        .map(word => ({
            ...word,
            range: {
                start: word.position,
                end: ({...word.position, character: word.position.character + word.word.length })
            }
        }))
        // Convert it to a Diagnostic
        .map(({word, range}) => ({
            severity: DiagnosticSeverity.Information,
            range: range,
            message: `Unknown word: "${word}"`,
            source: diagSource
        }))
    ;
}

