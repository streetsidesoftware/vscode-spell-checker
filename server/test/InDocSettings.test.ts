import { expect } from 'chai';
import { mergeSettings } from '../src/CSpellSettingsServer';
import * as Text from '../src/util/text';
import * as TextRange from '../src/util/TextRange';
import * as InDoc from '../src/InDocSettings';

const emptySettings = mergeSettings({}, {});

describe('Validate InDocSettings', () => {
    it('tests matching settings', () => {
        const matches = InDoc.internal.getPossibleInDocSettings(sampleCode)
            .map(a => a.slice(1).filter(a => !!a))
            .toArray();
        expect(matches.map(a => a[0])).to.deep.equal([
            'enableCompoundWords',
            'disableCompoundWords',
            'enableCOMPOUNDWords',
            'words whiteberry, redberry, lightbrown',
            'ignoreRegExp /\\/\\/\\/.*/',
            'ignoreRegexp w\\w+berry',
            'ignoreRegExp  /',
            'ignoreRegExp \\w+s{4}\\w+ */',
            'ignoreRegExp /faullts[/]?/ */',
            'ignore tripe, comment */',
            'ignoreWords tooo faullts',
        ]);
    });

    it('tests extracting in file settings for compound words', () => {
        expect(InDoc.getInDocumentSettings('')).to.deep.equal({});
        expect(InDoc.getInDocumentSettings('cSpell:enableCompoundWords'), 'cSpell:enableCompoundWords')
            .to.deep.equal({...emptySettings,  allowCompoundWords: true });
        expect(InDoc.getInDocumentSettings('cSpell:ENABLECompoundWords'), 'cSpell:ENABLECompoundWords')
            .to.deep.equal({...emptySettings,  allowCompoundWords: true });
        expect(InDoc.getInDocumentSettings('cSpell:disableCompoundWords'), 'cSpell:disableCompoundWords')
            .to.deep.equal({...emptySettings,  allowCompoundWords: false });
        expect(InDoc.getInDocumentSettings('cSpell:disableCompoundWORDS'), 'cSpell:disableCompoundWORDS')
            .to.deep.equal({...emptySettings, allowCompoundWords: false });
        expect(InDoc.getInDocumentSettings('cSpell:ENABLECompoundWords\ncSpell:disableCompoundWords'))
            .to.deep.equal({...emptySettings, allowCompoundWords: false });
        expect(InDoc.getInDocumentSettings('cSpell:disableCompoundWords\ncSpell:enableCompoundWords'))
            .to.deep.equal({...emptySettings, allowCompoundWords: true });
        expect(InDoc.getInDocumentSettings(sampleText)).to.deep.equal({...emptySettings, allowCompoundWords: true });
        expect(InDoc.getInDocumentSettings(sampleCode).allowCompoundWords).to.be.true;
    });

    it('tests finding words to add to dictionary', () => {
        const words = InDoc.internal.getWordsFromDocument(sampleCode);
        // we match to the end of the line, so the */ is included.
        expect(words).to.deep.equal(['whiteberry', 'redberry', 'lightbrown']);
        expect(InDoc.getIgnoreWordsFromDocument('Hello')).to.be.deep.equal([]);
    });

    it('tests finding words to ignore', () => {
        const words = InDoc.getIgnoreWordsFromDocument(sampleCode);
        // we match to the end of the line, so the */ is included.
        expect(words).to.deep.equal(['tripe', 'comment', '*/', 'tooo', 'faullts']);
        expect(InDoc.getIgnoreWordsFromDocument('Hello')).to.be.deep.equal([]);
    });

    it('tests finding ignoreRegExp', () => {
        const matches = InDoc.getIgnoreRegExpFromDocument(sampleCode);
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
        const ranges = TextRange.findMatchingRangesForPatterns(matches, sampleCode);
        // console.log(ranges);
        // console.log(replaceRangesWith(sampleCode, ranges));
        expect(ranges.length).to.be.equal(31);
    });

});
// cSpell:ignore faullts straange
// cSpell:ignoreRegExp \w+s{4}\w+
// cSpell:ignoreRegExp /\/\/\/.*/
// cSpell:ignoreRegExp  weird
const sampleCode = `
    // cSpell:enableCompoundWords
    // cSpell:disableCompoundWords
    // cSpell: enableCOMPOUNDWords
    // cSpell:words whiteberry, redberry, lightbrown
    // cSpell: ignoreRegExp /\\/\\/\\/.*/
    // cSpell:ignoreRegexp w\\w+berry
    // cSpell::ignoreRegExp  /
    /* cSpell:ignoreRegExp \\w+s{4}\\w+ */
    /* cSpell:ignoreRegExp /faullts[/]?/ */
    const berries = ['whiteberry', 'redberry', 'blueberry'];

    /* cSpell:ignore tripe, comment */
    // cSpell:: ignoreWords tooo faullts
    /// ignore triple comment, with misssspellings and faullts
    /// mooree prooobleems onn thisss line tooo with wordberry
    // misssspellings faullts

    // weirdberry can be straange.

`;


const sampleText = `
# cSpell:disableCompoundWords
# cSpell:enableCOMPOUNDWords
# happydays arehere againxx
`;

export function replaceRangesWith(text: string, ranges: TextRange.MatchRange[], w: string = '_') {
    let pos = 0;
    let result = '';
    for (const r of ranges) {
        result += text.slice(pos, r.startPos) + w.repeat(r.endPos - r.startPos);
        pos = r.endPos;
    }
    result += text.slice(pos);

    return result;
}

