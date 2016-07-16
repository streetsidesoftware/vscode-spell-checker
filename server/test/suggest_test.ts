import { expect } from 'chai';
import { wordListToTrie, suggest, wordsToTrie } from '../src/suggest';
import * as Suggest from '../src/suggest';
import { loadWords, processWordListLines } from '../src/spellChecker';
import * as Rx from 'rx';

const showLog = false;

function timeFn(a, n = 100) {
    return function (...args) {
        let r;
        const startTime = Date.now();
        for (let i = 0; i < n; ++i) {
            r = a(...args);
        }
        const diff = Date.now() - startTime;
        log('Time: ' + diff / n + 'ms');
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
        expect(trie).to.not.be.null;
    });
});


describe('test building trie for large vocab', function() {
    this.timeout(10000);

    it ('tests the speed of loading a large vocab', () => {
        let startTime = process.hrtime();
        return Rx.Observable.just(loadWords(__dirname + '/../../dictionaries/wordsEn.txt'))
            .tap(() => { startTime = process.hrtime(); })
            .concatMap(pWords => wordsToTrie(pWords))
            .last()
            .toPromise()
            .then(() => {
                const loadTime = timeDiff(process.hrtime(startTime));
                log(`Trie loaded in ${loadTime}`);
                expect(loadTime).to.be.lessThan(1.0);
            });
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

describe('matching hte', () => {
    const words = [
        'ate', 'hoe', 'hot', 'the', 'how', 'toe'
    ];

    const trie = wordListToTrie(words);

    it('checks best match', () => {
        const results = suggest(trie, 'hte');
        log(JSON.stringify(results, null, 4));
    });
});

describe('test for duplicate suggestions', () => {
    const words = [
        'apple', 'ape', 'able', 'apples', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
    ];

    const trie = wordListToTrie(words);

    it('tests ', () => {
        const word = 'beaet';
        const expectWord = 'beeeet';
        const extraWords = [ expectWord ];
        const trie = wordListToTrie([...words, ...extraWords]);
        const results = suggest(trie, word);
        const suggestions = results.map(({word}) => word);
        log(suggestions);
        expect(results).to.not.be.null;
        expect(suggestions).to.contain(expectWord);
    });
});

describe('test suggestions for GO', function() {
    this.timeout(10000);
    const pWords = loadWords(__dirname + '/../../dictionaries/go.txt');
    const pTrie = wordsToTrie(
        processWordListLines(pWords)
        .map(({word}) => word)
        // .tap(word => log(word))
    );

    it('test PHP suggestions', () => {
        return pTrie.then(trie => {
            const results = suggest(trie, 'Umarshaller');
            const suggestions = results.map(({word}) => word);
            expect(suggestions).to.contain('unmarshaler');
            log(suggestions);
        });
    });

});

/* */

/* */

describe('test suggestions for large vocab', function() {
    this.timeout(10000);
    const pWords = loadWords(__dirname + '/../../dictionaries/wordsEn.txt');
    const pTrie = wordsToTrie(pWords);

    it('tests character swaps', () => {
        return pTrie.then(trie => {
            const results = suggestA(trie, 'colunm');
            const suggestions = results.map(({word}) => word);
            expect(suggestions).to.contain('column');
            log(suggestions);
        });
    });

    it('Makes suggestions for "recieve"', () => {
        return pTrie.then(trie => {
            const results = suggestA(trie, 'recieve');
            const suggestions = results.map(({word}) => word);
            expect(suggestions).to.contain('receive');
            log(suggestions);
        });
    });

    it('Makes suggestions for "relasionchip"', () => {
        return pTrie.then(trie => {
            const results = suggestA(trie, 'relasionchip');
            const suggestions = results.map(({word}) => word);
            expect(suggestions).to.contain('relationship');
            expect(suggestions[0]).to.equal('relationship');
            log(suggestions);
        });
    });

    it('Alt Makes suggestions for "recieve"', () => {
        return pTrie.then(trie => {
            const results = suggestB(trie, 'recieve');
            const suggestions = results.map(({word}) => word);
            expect(suggestions).to.contain('receive');
            log(suggestions);
        });
    });

    it('Alt Makes suggestions for "relasionchip"', () => {
        return pTrie.then(trie => {
            const results = suggestB(trie, 'relasionchip');
            const suggestions = results.map(({word}) => word);
            expect(suggestions).to.contain('relationship');
            expect(suggestions[0]).to.equal('relationship');
            log(suggestions);
        });
    });

    it('checks best match for "hte"', () => {
        return pTrie.then(trie => {
            const results = suggest(trie, 'hte');
            log(JSON.stringify(results, null, 4));
        });
    });
});

/*  */

function timeDiff([seconds, nanoseconds]: number[]) {
    return seconds + nanoseconds / 1000000000.0;
}

function log(message: any) {
    if (showLog) {
        console.log(message);
    }
}
