import { expect } from 'chai';
import { isWordInDictionaryP } from '../src/spellChecker';
import { processWordListLinesRx } from '../src/wordListHelper';
import * as Rx from 'rx';

const minWordLength = 3;

describe('Verify Contractions', function() {
    it('tests contractions', () => {
        const words = ['apple', 'banana', 'orange', 'pear', 'grape', "doesn't", "can't", "won't"];
        return processWordListLinesRx(Rx.Observable.fromArray(words), minWordLength)
            .map(({setOfWords}) => setOfWords)
            .toPromise()
            .then(wordSet => {
                expect([...wordSet.keys()]).to.include('apple');
                expect([...wordSet.keys()]).to.include("doesn't");
                expect([...wordSet.keys()]).to.not.include('doesn');
            });
    });

});

describe('Verify Spell Checker', function() {
    // this.timeout(10000);

    it('did load', () => {
        return isWordInDictionaryP('yes').then(isFound => {
            expect(isFound).to.be.true;
        });
    });

    it('will ignore case.', () => {
        return isWordInDictionaryP('netherlands').then(isFound => {
            expect(isFound).to.be.true;
        });
    });

    it("has wasn't", () => {
        return isWordInDictionaryP("wasn't").then(isFound => {
            expect(isFound).to.be.true;
        });
    });

    it('Works with Typescript reserved words', () => {
        const reservedWords = ['const', 'stringify', 'constructor', 'delete', 'prototype', 'type'];

        return Rx.Observable.fromArray(reservedWords)
            .flatMap(word => isWordInDictionaryP(word).then(isFound => ({ word, isFound })))
            .tap(wf => expect(wf.isFound, 'Expect to be found: ' + wf.word).to.be.true)
            .toArray()
            .toPromise();
    });
});