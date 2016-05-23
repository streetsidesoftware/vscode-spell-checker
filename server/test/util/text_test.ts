import { splitCamelCaseWord } from '../../src/util/text';
import * as Text from '../../src/util/text';
import {expect} from 'chai';

describe('Util Text', () => {
    it('splitword', () => {
        expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        expect(splitCamelCaseWord('helloThere')).to.deep.equal(['hello', 'There']);
        expect(splitCamelCaseWord('HelloThere')).to.deep.equal(['Hello', 'There']);
        expect(splitCamelCaseWord('BigÁpple')).to.deep.equal(['Big', 'Ápple']);
    });

    it('extract words', () => {
        expect(Text.extractWordsFromText(`
            expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        `)).to.deep.equal([
            { word: 'expect', offset: 13 },
            { word: 'splitCamelCaseWord', offset: 20 },
            { word: 'hello', offset: 40 },
            { word: 'to', offset: 49 },
            { word: 'deep', offset: 52 },
            { word: 'equal', offset: 57 },
            { word: 'hello', offset: 65 },
        ]);
        expect(Text.extractWordsFromText(`
            expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        `)).to.deep.equal([
            { word: 'expect', offset: 13 },
            { word: 'splitCamelCaseWord', offset: 20 },
            { word: 'hello', offset: 40 },
            { word: 'to', offset: 49 },
            { word: 'deep', offset: 52 },
            { word: 'equal', offset: 57 },
            { word: 'hello', offset: 65 },
        ]);
        expect(Text.extractWordsFromText(`
            expect(splitCamelCaseWord('hello'));
        `)).to.deep.equal([
            { word: 'expect', offset: 13 },
            { word: 'splitCamelCaseWord', offset: 20 },
            { word: 'hello', offset: 40 },
        ]);
    });

    it('extract words from code', () => {
        expect(Text.extractWordsFromCode(`
            expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        `)).to.deep.equal([
            { word: 'expect', offset: 13 },
            { word: 'split', offset: 20 },
            { word: 'Camel', offset: 25 },
            { word: 'Case', offset: 30 },
            { word: 'Word', offset: 34 },
            { word: 'hello', offset: 40 },
            { word: 'to', offset: 49 },
            { word: 'deep', offset: 52 },
            { word: 'equal', offset: 57 },
            { word: 'hello', offset: 65 },
        ]);
        expect(Text.extractWordsFromCode(`
            expect(regExp.match(first_line));
        `)).to.deep.equal([
            { word: 'expect', offset: 13 },
            { word: 'reg', offset: 20 },
            { word: 'Exp', offset: 23 },
            { word: 'match', offset: 27 },
            { word: 'first', offset: 33 },
            { word: 'line', offset: 39 },
        ]);
        expect(Text.extractWordsFromCode(`
            expect(aHELLO);
        `)).to.deep.equal([
            { word: 'expect', offset: 13 },
            { word: 'a', offset: 20 },
            { word: 'HELLO', offset: 21 },
        ]);
    });
});