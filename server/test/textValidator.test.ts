import { expect } from 'chai';

import { wordSplitter, validateText, hasWordCheck } from '../src/textValidator';
import { SpellingDictionaryCollection } from '../src/SpellingDictionaryCollection';
import { createSpellingDictionary } from '../src/SpellingDictionary';
import * as TV from '../src/textValidator';
import * as Text from '../src/util/text';

describe('Validate textValidator functions', () => {
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
        const result = validateText(sampleText, dictCol);
        const errors = result.map(wo => wo.word).toArray();
        expect(errors).to.deep.equal(['giraffe', 'lightbrown', 'whiteberry', 'redberry']);
    });

    it('tests textValidator with word compounds', () => {
        const dictCol = getSpellingDictionaryCollection();
        const result = validateText(sampleText, dictCol, { compoundWords: true });
        const errors = result.map(wo => wo.word).toArray();
        expect(errors).to.deep.equal(['giraffe']);
    });

    it('tests finding words to ignore', () => {
        const words = TV.getIgnoreWordsFromDocument(sampleCode);
        // we match to the end of the line, so the */ is included.
        expect(words).to.deep.equal(['whiteberry', 'redberry', 'lightbrown', 'tripe', 'comment', '*/']);
        expect(TV.getIgnoreWordsFromDocument('Hello')).to.be.deep.equal([]);
    });

    it('tests finding ignoreRegExp', () => {
        const matches = TV.getIgnoreRegExpFromDocument(sampleCode);
        expect(matches).to.deep.equal([
            '/\\/\\/\\/.*/',
            'w\\w+berry',
            '/',
        ]);
        const regExpList = matches.map(s => Text.stringToRegExp(s)).map(a => a && a.toString() || '');
        expect(regExpList).to.deep.equal([
            (/\/\/\/.*/g).toString(),
            (/w\w+berry/gim).toString(),
            (/\//gim).toString(),
        ]);
        const ranges = Text.findMatchingRangesForPatterns(matches, sampleCode);
        console.log(ranges);
        console.log(replaceRangesWith(sampleCode, ranges));
        expect(ranges.length).to.be.equal(18);
        expect(TV.getIgnoreWordsFromDocument('Hello')).to.be.deep.equal([]);
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

// cSpell:ignoreRegExp /\/\/\/.*/
// cSpell:ignoreRegExp  weird
const sampleCode = `
    // cSpell:ignoreWords whiteberry, redberry, lightbrown
    // cSpell:ignoreRegExp /\\/\\/\\/.*/
    // cSpell:ignoreRegExp w\\w+berry
    // cSpell::ignoreRegExp  /
    const berries = ['whiteberry', 'redberry', 'blueberry'];

    /* cSpell:ignoreWords tripe, comment */
    /// ignore triple comment, with misssspellings and faullts
    /// mooree prooobleems onn thisss line tooo with wordberry

    // weirdberry can be straange.

`;


function replaceRangesWith(text: string, ranges: Text.MatchRange[], w: string = '_') {
    let pos = 0;
    let result = '';
    for (const r of ranges) {
        result += text.slice(pos, r.startPos) + w.repeat(r.endPos - r.startPos);
        pos = r.endPos;
    }
    result += text.slice(pos);

    return result;
}