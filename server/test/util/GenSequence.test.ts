import { GenSequence } from '../../src/util/GenSequence';
import { expect } from 'chai';

describe('GenSequence Tests', function() {
    it('tests constructing GenSequence', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = GenSequence(values);
        expect(gs.toArray()).to.deep.equal(values);
        // Try a second time.
        expect(gs.toArray()).to.deep.equal(values);

        // empty sequence
        expect(GenSequence([]).toArray()).to.deep.equal([]);
    });

    it('tests mapping values', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = GenSequence(values[Symbol.iterator]());
        const result = gs.map(a => 2 * a).toArray();
        expect(result).to.deep.equal(values.map(a => 2 * a));
    });

    it('tests filtering a sequence', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = GenSequence(values[Symbol.iterator]());
        const result = gs.filter(a => a % 2 === 1).toArray();
        expect(result).to.deep.equal(values.filter(a => a % 2 === 1));
    });

    it('tests reducing a sequence w/o init', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = GenSequence(values[Symbol.iterator]());
        const result = gs.reduce((a, v) => a + v);
        expect(result).to.deep.equal(values.reduce((a, v) => a + v));
    });

    it('tests reducing a sequence with init', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = GenSequence(values[Symbol.iterator]());
        const result = gs.reduce((a, v) => a + v, 0);
        expect(result).to.deep.equal(values.reduce((a, v) => a + v, 0));
    });

    it('tests combine', () => {
        const a = [1, 2, 3];
        const b = ['a', 'b', 'c', 'd'];
        const gs = GenSequence(a).combine((a, b) => '' + a + b, b);
        expect(gs.toArray()).to.be.deep.equal(['1a', '2b', '3c']);
        const gs2 = GenSequence(b).combine((a, b) => '' + a + (b || ''), a);
        expect(gs2.toArray()).to.be.deep.equal(['a1', 'b2', 'c3', 'd']);
    });

    it('tests concat', () => {
        const a = [1, 2, 3];
        const b = ['a', 'b', 'c', 'd'];
        const gs = GenSequence(a).map(a => '' + a).concat(b);
        expect(gs.toArray()).to.be.deep.equal(['1', '2', '3', 'a', 'b', 'c', 'd']);
    });


    it('tests with maps', () => {
        const m = new Map([['a', 1], ['b', 2], ['c', 3]]);
        const gs = GenSequence(m);
        expect(gs.toArray()).to.be.deep.equal([...m.entries()]);
        // Try a second time.
        expect(gs.toArray()).to.be.deep.equal([...m.entries()]);

        const m2 = new Map(gs);
        expect([...m2.entries()]).to.be.deep.equal([...m.entries()]);
    });

    it('tests with sets', () => {
        const s = new Set(['a', 'b', 'c']);
        const gs = GenSequence(s);
        expect(gs.toArray()).to.be.deep.equal([...s.keys()]);

        const s2 = new Set(gs);
        expect([...s2.entries()]).to.be.deep.equal([...s.entries()]);
    });

    it('tests reUsing Sequences', () => {
        const values = [1, 2, 3];
        const gs = GenSequence(values);
        const a = gs.map(a => 2 * a);
        const b = gs.map(a => 3 + a);
        expect(gs.toArray()).to.deep.equal(values);
        expect(a.toArray()).to.deep.equal([2, 4, 6]);
        expect(b.toArray()).to.deep.equal([4, 5, 6]);
    });
});