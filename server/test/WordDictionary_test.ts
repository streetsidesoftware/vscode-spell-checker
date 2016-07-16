import {expect} from 'chai';
import {WordDictionary} from '../src/WordDictionary';
import { loadWords } from '../src/spellChecker';

describe('Validate WordDictionary', function() {
    this.timeout(5000);
    const rxWords = loadWords(__dirname + '/../../dictionaries/wordsEn.txt');
    const dict = new WordDictionary(rxWords);

    it('Has apples', () => {
        return dict.has('apples').then(value => expect(value).to.be.true);
    });

    it('Expects suggestions to contain "apples"', () => {
        return dict.suggest('aples').then(sugs => {
            expect(sugs.map(sr => sr.word)).to.contain('apples');
        });
    });
    it('Expects suggestions to NOT contain "aples"', () => {
        return dict.suggest('aples').then(sugs => {
            expect(sugs.map(sr => sr.word)).to.not.contain('aples');
        });
    });
    it('Expects suggestions to NOT contain "banana"', () => {
        return dict.suggest('aples').then(sugs => {
            expect(sugs.map(sr => sr.word)).to.not.contain('banana');
        });
    });
    it('Expects suggestions to contain "bananas"', () => {
        return dict.suggest('banana').then(sugs => {
            expect(sugs.map(sr => sr.word)).to.contain('bananas');
        });
    });
});