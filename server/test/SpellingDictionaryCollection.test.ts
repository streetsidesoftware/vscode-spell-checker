import { expect } from 'chai';
import { SpellingDictionaryCollection } from '../src/SpellingDictionaryCollection';
import { createSpellingDictionary, createSpellingDictionaryRx } from '../src/SpellingDictionary';
import * as Rx from 'rx';

describe('Verify using multiple dictionaries', () => {
    const wordsA = ['apple', 'banana', 'orange', 'pear', 'pineapple', 'mango', 'avocado', 'grape', 'strawberry', 'blueberry', 'blackberry'];
    const wordsB = ['ape', 'lion', 'tiger', 'elephant', 'monkey', 'gazelle', 'antelope', 'aardvark', 'hyena'];
    const wordsC = ['ant', 'snail', 'beetle', 'worm', 'stink bug', 'centipede', 'millipede', 'flea', 'fly'];
    it('checks for existence', () => {
        const dicts = [
            createSpellingDictionary(wordsA),
            createSpellingDictionary(wordsB),
            createSpellingDictionary(wordsC),
        ];

        const dictCollection = new SpellingDictionaryCollection(dicts);
        expect(dictCollection.has('mango')).to.be.true;
        expect(dictCollection.has('tree')).to.be.false;
    });

    it('checks for suggestions', () => {
        const dicts = [
            createSpellingDictionary(wordsA),
            createSpellingDictionary(wordsB),
            createSpellingDictionary(wordsA),
            createSpellingDictionary(wordsC),
        ];

        const dictCollection = new SpellingDictionaryCollection(dicts);
        const sugsForTango = dictCollection.suggest('tango', 10);
        expect(sugsForTango).to.be.not.empty;
        expect(sugsForTango[0].word).to.be.equal('mango');
        // make sure there is only one mango suggestion.
        expect(sugsForTango.map(a => a.word).filter(a => a === 'mango')).to.be.deep.equal(['mango']);
    });


    it('checks for suggestions from mixed sources', () => {
        return Promise.all([
            createSpellingDictionaryRx(Rx.Observable.fromArray(wordsA)),
            createSpellingDictionary(wordsB),
            createSpellingDictionary(wordsC),
        ])
        .then(dicts => {
            const dictCollection = new SpellingDictionaryCollection(dicts);
            expect(dictCollection.has('mango'));
            expect(dictCollection.has('lion'));
            expect(dictCollection.has('ant'));

            const sugsForTango = dictCollection.suggest('tango', 10);
            expect(sugsForTango).to.be.not.empty;
            expect(sugsForTango[0].word).to.be.equal('mango');
            // make sure there is only one mango suggestion.
            expect(sugsForTango.map(a => a.word).filter(a => a === 'mango')).to.be.deep.equal(['mango']);
        });

    });
});

