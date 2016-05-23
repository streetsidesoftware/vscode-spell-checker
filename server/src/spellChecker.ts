import * as Rx from 'rx';
import * as fs from 'fs';
import * as path from 'path';


export interface WordDictionary {
    [index: string]: boolean;
}

export function loadWordList(filename: string): Rx.Observable<WordDictionary> {
    const reader = Rx.Observable.fromNodeCallback<string>(fs.readFile);

    return reader(filename, 'utf-8')
        .flatMap(text => {
            return text.split(/\r?\n/g);
        })
        .map(line => line.trim())
        .filter(line => line !== '')
        .map(line => line.toLowerCase())
        .reduce((wordList, word): WordDictionary => {
            wordList[word] = true;
            return wordList;
        }, <WordDictionary>{} );
}

export function isWordInDictionary(word: string): Rx.Promise<boolean> {
    return wordList.then(wordList => {
        return wordList[word.toLowerCase()] === true;
    });
}

const wordList: Rx.Promise<WordDictionary> = loadWordList(path.join(__dirname, '..', '..', '..', 'dictionaries', 'wordsEn.txt'))
    .toPromise();
