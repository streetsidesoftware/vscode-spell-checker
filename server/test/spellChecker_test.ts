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
        return Rx.Observable.fromArray([
            isWordInDictionary('const').then(isFound => {
                expect(isFound).to.be.true;
            }),
            isWordInDictionary('stringify').then(isFound => {
                expect(isFound).to.be.true;
            }),
        ])
        .flatMap(a => a)
        .toPromise();
    });
});