import { expect } from 'chai';
import { createSpellingDictionaryRx, createSpellingDictionary, SpellingDictionaryInstance } from '../src/SpellingDictionary';
import * as Rx from 'rx';

describe('Verify building Dictionary', () => {
    it('build', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];

        return createSpellingDictionaryRx(Rx.Observable.fromArray(words))
            .then(dict => {
                expect(dict).to.be.instanceof(SpellingDictionaryInstance);
                if (dict instanceof SpellingDictionaryInstance) {
                    expect(dict.words).to.be.instanceof(Set);
                    expect(dict.trie.c).to.be.instanceof(Map);
                }
                expect(dict.has('apple')).to.be.true;
                const suggestions = dict.suggest('aple').map(({word}) => word);
                expect(suggestions).to.contain('apple');
                expect(suggestions).to.contain('ape');
                expect(suggestions).to.not.contain('banana');
            });
    });

    it('build', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
        ];

        const dict = createSpellingDictionary(words);
        expect(dict).to.be.instanceof(SpellingDictionaryInstance);
        if (dict instanceof SpellingDictionaryInstance) {
            expect(dict.words).to.be.instanceof(Set);
            expect(dict.trie.c).to.be.instanceof(Map);
        }
        expect(dict.has('apple')).to.be.true;
        const suggestions = dict.suggest('aple').map(({word}) => word);
        expect(suggestions).to.contain('apple');
        expect(suggestions).to.contain('ape');
        expect(suggestions).to.not.contain('banana');
    });
});

