import { expect } from 'chai';
import { wordListToTrie, suggest, wordsToTrie } from '../src/suggest';
import * as Suggest from '../src/suggest';
import { loadWords } from '../src/spellChecker';

function timeFn(a) {
    return function (...args) {
        const startTime = Date.now();
        const r = a(...args);
        const diff = Date.now() - startTime;
        console.log('Time: ' + diff + 'ms');
        return r;
    };
}

const suggestA = timeFn(Suggest.suggest);
const suggestB = timeFn(Suggest.suggestAlt);

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

    it('tests character swaps', () => {
        return pTrie.then(trie => {
            const results = suggestA(trie, 'colunm');
            const suggestions = results.map(({word}) => word);
            expect(suggestions).to.contain('column');
            console.log(suggestions);
        });
    });

    it('Makes suggestions for "recieve"', () => {
        return pTrie.then(trie => {
            const results = suggestA(trie, 'recieve');
            const suggestions = results.map(({word}) => word);
            expect(suggestions).to.contain('receive');
            console.log(suggestions);
        });
    });

    it('Makes suggestions for "relasionchip"', () => {
        return pTrie.then(trie => {
            const results = suggestA(trie, 'relasionchip');
            const suggestions = results.map(({word}) => word);
            expect(suggestions).to.contain('relationship');
            expect(suggestions[0]).to.equal('relationship');
            console.log(suggestions);
        });
    });

    it('Alt Makes suggestions for "recieve"', () => {
        return pTrie.then(trie => {
            const results = suggestB(trie, 'recieve');
            const suggestions = results.map(({word}) => word);
            expect(suggestions).to.contain('receive');
            console.log(suggestions);
        });
    });

    it('Alt Makes suggestions for "relasionchip"', () => {
        return pTrie.then(trie => {
            const results = suggestB(trie, 'relasionchip');
            const suggestions = results.map(({word}) => word);
            expect(suggestions).to.contain('relationship');
            expect(suggestions[0]).to.equal('relationship');
            console.log(suggestions);
        });
    });
});

/*  */
