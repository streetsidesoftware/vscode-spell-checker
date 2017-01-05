import { expect } from 'chai';
import * as TextRange from '../src/util/TextRange';
import { regExMatchUrls, regExMatchCommonHexFormats } from '../src/RegExpPatterns';
import * as RegPat from '../src/RegExpPatterns';

const matchUrl = regExMatchUrls.source;
const matchHexValues = regExMatchCommonHexFormats.source;

describe('Validate InDocSettings', () => {

    it('tests finding a set of matching positions', () => {
        const text = sampleCode2;
        const ranges = TextRange.findMatchingRangesForPatterns([
            RegPat.regExMatchUrls,
            RegPat.regExSpellingGuard,
            RegPat.regExMatchCommonHexFormats,
        ], text);
        expect(ranges.length).to.be.equal(8);
    });

    it('tests merging inclusion and exclusion patterns into an inclusion list', () => {
        const text = sampleCode2;
        const includeRanges = TextRange.findMatchingRangesForPatterns([
            RegPat.regExString,
            RegPat.regExPhpHereDoc,
            RegPat.regExCStyleComments,
        ], text);
        const excludeRanges = TextRange.findMatchingRangesForPatterns([
            RegPat.regExSpellingGuard,
            RegPat.regExMatchUrls,
            RegPat.regExMatchCommonHexFormats,
        ], text);
        const mergedRanges = TextRange.excludeRanges(includeRanges, excludeRanges);
        expect(mergedRanges.length).to.be.equal(21);
    });

    it('test for hex values', () => {
        expect(RegPat.regExHexValues.test('FFEE')).to.be.true;
    });

    it('tests finding matching positions', () => {
        const text = sampleCode2;
        const urls = TextRange.findMatchingRanges(matchUrl, text);
        expect(urls.length).equals(2);

        const hexRanges = TextRange.findMatchingRanges(matchHexValues, text);
        expect(hexRanges.length).to.be.equal(5);
        expect(hexRanges[2].startPos).to.be.equal(text.indexOf('0xbadc0ffee'));

        const disableChecker = TextRange.findMatchingRanges(RegPat.regExSpellingGuard, text);
        expect(disableChecker.length).to.be.equal(3);

        const hereDocs = TextRange.findMatchingRanges(RegPat.regExPhpHereDoc, text);
        expect(hereDocs.length).to.be.equal(3);

        const strings = TextRange.findMatchingRanges(RegPat.regExString, text);
        expect(strings.length).to.be.equal(12);
    });


});

const sampleCode2 = `
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
