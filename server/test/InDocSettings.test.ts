import { expect } from 'chai';
import { mergeSettings } from '../src/CSpellSettingsServer';
import * as Text from '../src/util/text';
import * as InDoc from '../src/InDocSettings';

const emptySettings = mergeSettings({}, {});

describe('Validate InDocSettings', () => {
    it('tests extracting in file settings for compound words', () => {
        expect(InDoc.getInDocumentSettings('')).to.deep.equal(emptySettings);
        expect(InDoc.getInDocumentSettings('cSpell:enableCompoundWords')).to.deep.equal({...emptySettings, allowCompoundWords: true });
        expect(InDoc.getInDocumentSettings('cSpell:disableCompoundWords')).to.deep.equal({...emptySettings, allowCompoundWords: false });
    });

    it('tests finding words to ignore', () => {
        const words = InDoc.getIgnoreWordsFromDocument(sampleCode);
        // we match to the end of the line, so the */ is included.
        expect(words.toArray()).to.deep.equal(['whiteberry', 'redberry', 'lightbrown', 'tripe', 'comment', '*/']);
        expect(InDoc.getIgnoreWordsFromDocument('Hello').toArray()).to.be.deep.equal([]);
    });

    it('tests finding ignoreRegExp', () => {
        const matches = InDoc.getIgnoreRegExpFromDocument(sampleCode).toArray();
        expect(matches).to.deep.equal([
            '/\\/\\/\\/.*/',
            'w\\w+berry',
            '/',
            '\\w+s{4}\\w+',
            '/faullts[/]?/ */',
         ]);
        const regExpList = matches.map(s => Text.stringToRegExp(s)).map(a => a && a.toString() || '');
        expect(regExpList).to.deep.equal([
            (/\/\/\/.*/g).toString(),
            (/w\w+berry/gim).toString(),
            (/\//gim).toString(),
            (/\w+s{4}\w+/gim).toString(),
            (/faullts[/]?\/ */g).toString(),
        ]);
        const ranges = Text.findMatchingRangesForPatterns(matches, sampleCode);
        // console.log(ranges);
        // console.log(replaceRangesWith(sampleCode, ranges));
        expect(ranges.length).to.be.equal(30);
    });

});
// cSpell:ignore faullts straange
// cSpell:ignoreRegExp \w+s{4}\w+
// cSpell:ignoreRegExp /\/\/\/.*/
// cSpell:ignoreRegExp  weird
const sampleCode = `
    // cSpell:enableCompoundWords
    // cSpell:disableCompoundWords
    // cSpell:enableCompoundWords
    // cSpell:ignoreWords whiteberry, redberry, lightbrown
    // cSpell:ignoreRegExp /\\/\\/\\/.*/
    // cSpell:ignoreRegExp w\\w+berry
    // cSpell::ignoreRegExp  /
    /* cSpell:ignoreRegExp \\w+s{4}\\w+ */
    /* cSpell:ignoreRegExp /faullts[/]?/ */
    const berries = ['whiteberry', 'redberry', 'blueberry'];

    /* cSpell:ignoreWords tripe, comment */
    /// ignore triple comment, with misssspellings and faullts
    /// mooree prooobleems onn thisss line tooo with wordberry
    // misssspellings faullts

    // weirdberry can be straange.

`;


export function replaceRangesWith(text: string, ranges: Text.MatchRange[], w: string = '_') {
    let pos = 0;
    let result = '';
    for (const r of ranges) {
        result += text.slice(pos, r.startPos) + w.repeat(r.endPos - r.startPos);
        pos = r.endPos;
    }
    result += text.slice(pos);

    return result;
}