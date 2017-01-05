import { splitCamelCaseWord } from '../../src/util/text';
import * as Text from '../../src/util/text';
import { expect } from 'chai';

describe('Util Text', () => {
    it('tests build regexp from string', () => {
        const regEx1 = Text.stringToRegExp('');
        expect(regEx1).to.be.undefined;
        const regEx2 = Text.stringToRegExp('a');
        expect(regEx2!.toString()).to.be.equal('/a/gim');
        const regEx3 = Text.stringToRegExp('/');
        expect(regEx3).not.to.be.undefined;
        expect(regEx3!.toString()).to.be.equal('/\\//gim');
    });

    it('splits words', () => {
        expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        expect(splitCamelCaseWord('helloThere')).to.deep.equal(['hello', 'There']);
        expect(splitCamelCaseWord('HelloThere')).to.deep.equal(['Hello', 'There']);
        expect(splitCamelCaseWord('BigÁpple')).to.deep.equal(['Big', 'Ápple']);
    });

    it('extract word from text', () => {
        expect(Text.extractWordsFromText(`
            // could've, would've, couldn't've, wasn't, y'all, 'twas
        `).toArray()).to.deep.equal([
                { word: "could've", offset: 16 },
                { word: "would've", offset: 26 },
                { word: "couldn't've", offset: 36 },
                { word: "wasn't", offset: 49 },
                { word: "y'all", offset: 57 },
                { word: 'twas', offset: 65 },
            ]);
    });

    it('extract words', () => {
        expect(Text.extractWordsFromText(`
            expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        `).toArray()).to.deep.equal([
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
        `).toArray()).to.deep.equal([
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
        `).toArray()).to.deep.equal([
                { word: 'expect', offset: 13 },
                { word: 'splitCamelCaseWord', offset: 20 },
                { word: 'hello', offset: 40 },
            ]);
    });

    it('extract words from code', () => {
        expect(Text.extractWordsFromCode(`
            expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        `).toArray()).to.deep.equal([
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
        `).toArray()).to.deep.equal([
                { word: 'expect', offset: 13 },
                { word: 'reg', offset: 20 },
                { word: 'Exp', offset: 23 },
                { word: 'match', offset: 27 },
                { word: 'first', offset: 33 },
                { word: 'line', offset: 39 },
            ]);
        expect(Text.extractWordsFromCode(`
            expect(aHELLO);
        `).toArray()).to.deep.equal([
                { word: 'expect', offset: 13 },
                { word: 'a', offset: 20 },
                { word: 'HELLO', offset: 21 },
            ]);
    });

    it('splits words like HTMLInput', () => {
        return Text.extractWordsFromCodeRx('var value = HTMLInput.value;')
            .map(({word}) => word)
            .toArray()
            .toPromise()
            .then(words => {
                expect(words).to.deep.equal(['var', 'value', 'HTML', 'Input', 'value']);
            });
    });

    it('tests matchCase', () => {
        expect(Text.matchCase('Apple', 'orange')).to.be.equal('Orange');
        expect(Text.matchCase('apple', 'ORANGE')).to.be.equal('orange');
        expect(Text.matchCase('apple', 'orange')).to.be.equal('orange');
        expect(Text.matchCase('APPLE', 'orange')).to.be.equal('ORANGE');
        expect(Text.matchCase('ApPlE', 'OrangE')).to.be.equal('OrangE');
    });

    it('tests skipping Chinese characters', () => {
        expect(Text.extractWordsFromCode(`
            <a href="http://www.ctrip.com" title="携程旅行网">携程旅行网</a>
        `).map(wo => wo.word).toArray()).to.deep.equal(
            ['a', 'href', 'http', 'www', 'ctrip', 'com', 'title', 'a']
            );
    });

    it('tests Greek characters', () => {
        expect(Text.extractWordsFromCode(`
            Γ γ	gamma, γάμμα
        `).map(wo => wo.word).toArray()).to.deep.equal(
            ['Γ', 'γ', 'gamma', 'γάμμα']
            );
    });

    it('test case of Chinese characters', () => {
        expect(Text.isUpperCase('携程旅行网')).to.be.false;
        expect(Text.isLowerCase('携程旅行网')).to.be.false;
    });

    it('tests breaking up text into lines', () => {
        const parts = [
            '',
            '/*',
            ' * this is a comment.\r',
            ' */',
            '',
        ];
        const sampleText = parts.join('\n');
        const i = Text.extractLinesOfText(sampleText);
        const r = [
            i.next().value.text,
            i.next().value.text,
            i.next().value.text,
            i.next().value.text,
        ];
        expect(r.join('')).to.be.equal(parts.join('\n'));
        const lines = [...Text.extractLinesOfText(sampleCode)].map(m => m.text);
        expect(lines.length).to.be.equal(64);
    });
});

const sampleCode = `
/*
 * this is a comment.\r
 */

const text = 'some nice text goes here';
const url = 'https://www.google.com?q=typescript';
const url2 = 'http://www.weirddomain.com?key=jdhehdjsiijdkejshaijncjfhe';
const cssHexValue = '#cccd';
const cHexValue = 0x5612abcd;
const cHexValueBadCoffee = 0xbadc0ffee;

// spell-checker:disable
const unicodeHexValue = '\\uBABC';
const unicodeHexValue2 = '\\x\{abcd\}';

// spell-checker:enable

/* More code and comments */

// Make sure /* this works.

/* spell-checker:disable */

// nested disabled checker is not supported.

// spell-checker:disable

// nested spell-checker:enable <--> checking is now turned on.

// This will be checked

/*
 * spell-checker:enable  <-- this makes no difference because it was already turned back on.
 */

let text = '';
for (let i = 0; i < 99; ++i) {
    text += ' ' + i;
}

const string1 = 'This is a single quote string.  it\'s a lot of fun.'
const string2 = "How about a double quote string?";
const templateString = \`
can contain " and '

 \`;

$phpHereDocString = <<<SQL
    SELECT * FROM users WHERE id in :ids;
SQL;

$phpHereDocString = <<<"SQL"
    SELECT * FROM users WHERE id in :ids;
SQL;

$phpNowDocString = <<<'SQL'
    SELECT * FROM users WHERE id in :ids;
SQL;

// cSpell:disable

Not checked.

`;
