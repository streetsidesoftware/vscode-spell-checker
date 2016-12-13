
import { expect } from 'chai';
import * as Rx from 'rx';
import { wordListCompiler } from '../src/wordListCompiler';

describe('Validate the wordListCompiler', function() {
    it('tests a small list of words', () => {
        const words = ['apple', 'banana', 'orange', 'zebra', 'apple', 'mango'];
        return wordListCompiler(Rx.Observable.from(words)).then(code => {
            expect(code).to.match(/apple/);
        });
    });
});