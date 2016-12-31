import { expect } from 'chai';

import { wordSplitter } from '../src/textValidator';

describe('Validate textValidator functions', () => {
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

    it('tests trying to split words that are too small', () => {
        expect([...wordSplitter('')]).to.be.deep.equal([]);
        expect([...wordSplitter('a')]).to.be.deep.equal([]);
        expect([...wordSplitter('ap')]).to.be.deep.equal([]);
        expect([...wordSplitter('app')]).to.be.deep.equal([]);
        expect([...wordSplitter('appl')]).to.be.deep.equal([]);
        expect([...wordSplitter('apple')]).to.be.deep.equal([]);
        expect([...wordSplitter('apples')]).to.be.deep.equal([
            ['app', 'les']
        ]);
    });
});