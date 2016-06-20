import { expect } from 'chai';
import { isWordInDictionary } from '../src/spellChecker';
import * as Rx from 'rx';

describe('Verify Spell Checker', () => {
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

    it('Works with Typescript reserved words', () => {
        const reservedWords = ['const', 'stringify', 'constructor', 'delete', 'prototype', 'type'];

        return Rx.Observable.fromArray(reservedWords)
            .flatMap(word => isWordInDictionary(word).then(isFound => ({ word, isFound })))
            .tap(wf => expect(wf.isFound, 'Expect to be found: ' + wf.word).to.be.true)
            .toArray()
            .toPromise();
    });
});