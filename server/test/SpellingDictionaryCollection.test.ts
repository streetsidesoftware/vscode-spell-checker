import { expect } from 'chai';
import { SpellingDictionaryCollection } from '../src/SpellingDictionaryCollection';
import { createSpellingDictionary } from '../src/SpellingDictionary';
import * as Rx from 'rx';

describe('Verify using multiple dictionaries', () => {
    const wordsA = ['apple', 'banana', 'orange', 'pear', 'pineapple', 'mango', 'avocado', 'grape', 'strawberry', 'blueberry', 'blackberry'];
    const wordsB = ['ape', 'lion', 'tiger', 'elephant', 'monkey', 'gazelle', 'antelope', 'aardvark'];
    it('checks for existence', () => {
        return Promise.all([
            createSpellingDictionary(Rx.Observable.fromArray(wordsA)),
            createSpellingDictionary(Rx.Observable.fromArray(wordsB)),
        ]).then((dicts) => {
            const dictCollection = new SpellingDictionaryCollection(dicts);
            expect(dictCollection.has('mango')).to.be.true;
            expect(dictCollection.has('tree')).to.be.false;
        });
    });

    it('checks for suggestions', () => {
        return Promise.all([
            createSpellingDictionary(Rx.Observable.fromArray(wordsA)),
            createSpellingDictionary(Rx.Observable.fromArray(wordsB)),
        ]).then((dicts) => {
            const dictCollection = new SpellingDictionaryCollection(dicts);
            const sugs = dictCollection.suggest('tango', 10);
            expect(sugs).to.be.not.empty;
            expect(sugs[0].word).to.be.equal('mango');
        });
    });
});

