import { WordDictionary } from './WordDictionary';
import { DictionaryAssociation } from './DictionaryAssociation';
import * as Rx from 'rx';
import { configWordDictionary } from './spellChecker';

export interface TextDocument {
    languageId: string;
}

export class DictionaryCollection {
    static dictionaries = new Map<string, Rx.Promise<WordDictionary>>();

    constructor(private dictAssociations: DictionaryAssociation[]) {}

    public matchingDictionaries(doc: TextDocument) {
        const dicts = this.dictAssociations
            .filter(assoc => assoc.matchProgLang(doc.languageId))
            .map(assoc => {
                const { pathToDictionary: path, matchSpokenLang } = assoc;
                const { dictionaries} = DictionaryCollection;
                if (! dictionaries.has(path)) {
                    dictionaries.set(path, configWordDictionary(path, !!matchSpokenLang));
                }
                return dictionaries.get(path);
            });
        return dicts;
    }

    public static addDictionary(uri: string, dict: Rx.Promise<WordDictionary>) {
        DictionaryCollection.dictionaries.set(uri, dict);
        return DictionaryCollection;
    }
}