import { expect } from 'chai';

import { wordSplitter, validateText, hasWordCheck } from '../src/textValidator';
import { SpellingDictionaryCollection } from '../src/SpellingDictionaryCollection';
import { createSpellingDictionary } from '../src/SpellingDictionary';
import { serverEnv } from '../src/serverEnv';
import * as path from 'path';

// cSpell:enableCompoundWords

describe('Validate textValidator functions', () => {
    const cwd = process.cwd();
    serverEnv.root = path.join(cwd, '..', 'client');

    // cSpell:disable
    it('tests splitting words', () => {
        const results = [...wordSplitter('appleorange')];
        expect(results).to.deep.equal([
            ['app', 'leorange'],
            ['appl', 'eorange'],
            ['apple', 'orange'],
            ['appleo', 'range'],
            ['appleor', 'ange'],
            ['appleora', 'nge'],
        ]);
    });
    // cSpell:enable

    it('tests trying to split words that are too small', () => {
        expect([...wordSplitter('')]).to.be.deep.equal([]);
        expect([...wordSplitter('a')]).to.be.deep.equal([]);
        expect([...wordSplitter('ap')]).to.be.deep.equal([]);
        expect([...wordSplitter('app')]).to.be.deep.equal([]);
        // cSpell:disable
        expect([...wordSplitter('appl')]).to.be.deep.equal([]);
        // cSpell:enable
        expect([...wordSplitter('apple')]).to.be.deep.equal([]);
        expect([...wordSplitter('apples')]).to.be.deep.equal([
            ['app', 'les']
        ]);
    });

    it('tests hasWordCheck', () => {
        const dictCol = getSpellingDictionaryCollection();
        expect(hasWordCheck(dictCol, 'brown', true)).to.be.true;
        expect(hasWordCheck(dictCol, 'white', true)).to.be.true;
        expect(hasWordCheck(dictCol, 'berry', true)).to.be.true;
        expect(hasWordCheck(dictCol, 'whiteberry', true)).to.be.true;
        expect(hasWordCheck(dictCol, 'redberry', true)).to.be.true;
        expect(hasWordCheck(dictCol, 'lightbrown', true)).to.be.true;
    });

    it('tests textValidator no word compounds', () => {
        const dictCol = getSpellingDictionaryCollection();
        const result = validateText(sampleText, dictCol, {});
        const errors = result.map(wo => wo.word).toArray();
        expect(errors).to.deep.equal(['giraffe', 'lightbrown', 'whiteberry', 'redberry']);
    });

    it('tests textValidator with word compounds', () => {
        const dictCol = getSpellingDictionaryCollection();
        const result = validateText(sampleText, dictCol, { allowCompoundWords: true });
        const errors = result.map(wo => wo.word).toArray();
        expect(errors).to.deep.equal(['giraffe']);
    });

    it('tests ignoring words that consist of a single repeated letter', () => {
        const dictCol = getSpellingDictionaryCollection();
        const text = ' tttt gggg xxxxxxx jjjjj xxxkxxxx xxxbxxxx \n' + sampleText;
        const result = validateText(text, dictCol, { allowCompoundWords: true });
        const errors = result.map(wo => wo.word).toArray().sort();
        expect(errors).to.deep.equal(['giraffe', 'xxxbxxxx', 'xxxkxxxx']);
    });

});

function getSpellingDictionaryCollection() {
    const dicts = [
        createSpellingDictionary(colors),
        createSpellingDictionary(fruit),
        createSpellingDictionary(animals),
        createSpellingDictionary(insects),
        createSpellingDictionary(words),
    ];

    return new SpellingDictionaryCollection(dicts);
}

const colors = ['red', 'green', 'blue', 'black', 'white', 'orange', 'purple', 'yellow', 'gray', 'brown'];
const fruit = [
    'apple', 'banana', 'orange', 'pear', 'pineapple', 'mango', 'avocado', 'grape', 'strawberry', 'blueberry', 'blackberry', 'berry'
];
const animals = ['ape', 'lion', 'tiger', 'Elephant', 'monkey', 'gazelle', 'antelope', 'aardvark', 'hyena'];
const insects = ['ant', 'snail', 'beetle', 'worm', 'stink bug', 'centipede', 'millipede', 'flea', 'fly'];
const words = ['the', 'and', 'is', 'has', 'ate', 'light', 'dark', 'little', 'big'];

const sampleText = `
    The elephant and giraffe
    The lightbrown worm ate the apple, mango, and, strawberry.
    The little ant ate the big purple grape.
    The orange tiger ate the whiteberry and the redberry.
`;
