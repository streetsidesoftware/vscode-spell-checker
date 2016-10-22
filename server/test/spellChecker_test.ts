import { expect } from 'chai';
import { isWordInDictionary } from '../src/spellChecker';
import { processWordListLines } from '../src/wordListHelper';
import * as Rx from 'rx';

const minWordLength = 3;

describe('Verify Contractions', function() {
    it('tests contractions', () => {
        const words = ['apple', 'banana', 'orange', 'pear', 'grape', "doesn't", "can't", "won't"];
        return processWordListLines(Rx.Observable.fromArray(words), minWordLength)
            .map(({setOfWords}) => setOfWords)
            .toPromise()
            .then(wordSet => {
                expect(wordSet).to.have.property('apple');
                expect(wordSet).to.have.property("doesn't");
                expect(wordSet).to.not.have.property('doesn');
            });
    });

});

describe('Verify Spell Checker', function() {
    // this.timeout(10000);

    it('did load', () => {
        return isWordInDictionary('yes').then(isFound => {
            expect(isFound).to.be.true;
        });
    });

    it('will ignore case.', () => {
        return isWordInDictionary('netherlands').then(isFound => {
            expect(isFound).to.be.true;
        });
    });

    it("has wasn't", () => {
        return isWordInDictionary("wasn't").then(isFound => {
            expect(isFound).to.be.true;
        });
    });

    it('Works with Typescript reserved words', () => {
        const reservedWords = ['const', 'stringify', 'constructor', 'delete', 'prototype', 'type'];

        return Rx.Observable.fromArray(reservedWords)
            .flatMap(word => isWordInDictionary(word).then(isFound => ({ word, isFound })))
            .tap(wf => expect(wf.isFound, 'Expect to be found: ' + wf.word).to.be.true)
            .toArray()
            .toPromise();
    });
});