import { expect } from 'chai';
import { wordListToTrie, suggest, wordsToTrie } from '../src/suggest';
import { loadWords } from '../src/spellChecker';
import * as Rx from 'rx';

describe('test building tries', () => {
    it('build', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach'
        ];


        const trie = wordListToTrie(words);

        const x = trie;

        expect(trie).to.not.be.null;
    });
});


/* */

describe('test suggestions', () => {
    const words = [
        'apple', 'ape', 'able', 'apples', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
    ];

    const trie = wordListToTrie(words);

    it('tests matches aple', () => {
        const results = suggest(trie, 'aple');
        const suggestions = results.map(({word}) => word);
        expect(results).to.not.be.null;
        expect(suggestions).to.contain('apple');
        expect(suggestions).to.contain('ape');
        expect(suggestions).to.not.contain('banana');
    });

    it('tests matches approch', () => {
        const results = suggest(trie, 'approch');
        const suggestions = results.map(({word}) => word);
        expect(suggestions).to.not.contain('apple');
        expect(suggestions).to.contain('approach');
        expect(suggestions).to.not.contain('banana');
    });


    it('tests matches ear', () => {
        const results = suggest(trie, 'ear');
        const suggestions = results.map(({word}) => word);
        expect(suggestions).to.not.contain('apple');
        expect(suggestions).to.contain('pear');
        expect(suggestions).to.contain('bear');
    });
});

/* */

/* */

describe('test suggestions for large vocab', () => {
    const pWords = loadWords(__dirname + '/../../dictionaries/wordsEn.txt');
    const pTrie = wordsToTrie(pWords);

    it('Makes suggestions for "recieve"', () => {
        return pTrie.then(trie => {
            const results = suggest(trie, 'recieve');
            const suggestions = results.map(({word}) => word);
            expect(suggestions).to.contain('receive');
            console.log(suggestions);
        });
    });

    it('Makes suggestions for "relasionchip"', () => {
        return pTrie.then(trie => {
            const results = suggest(trie, 'relasionchip');
            const suggestions = results.map(({word}) => word);
            expect(suggestions).to.contain('relationship');
            expect(suggestions[0]).to.equal('relationship');
            console.log(suggestions);
        });
    });
});

/*  */
