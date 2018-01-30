import {expect} from 'chai';
import * as Validator from '../src/validator';
const loremIpsum = require('lorem-ipsum');
import { CSpellSettings } from 'cspell';
import * as tds from 'cspell';

import { getDefaultSettings } from 'cspell';

// cSpell:ignore brouwn jumpped lazzy wrongg mispelled ctrip nmove mischecked

const defaultSettings: CSpellSettings = { ...getDefaultSettings(), enabledLanguageIds: ['plaintext', 'javascript']};

function getSettings(text: string, languageId: string) {
    return tds.constructSettingsForText(defaultSettings, text, languageId);
}

describe('Validator', function() {
    this.timeout(5000);

    it('validates the validator', () => {
        const text = 'The quick brouwn fox jumpped over the lazzy dog.';
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(({text}) => text);
            expect(words).to.be.deep.equal(['brouwn', 'jumpped', 'lazzy']);
        });
    });

    it('validates ignore Case', () => {
        const text = 'The Quick brown fox Jumped over the lazy dog.';
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(({text}) => text);
            expect(words).to.be.deep.equal([]);
        });
    });

    it('validate limit', () => {
        const text = loremIpsum({ count: 5, unit: 'paragraphs' });
        const languageId = 'plaintext';
        const settings = {...getSettings(text, languageId), maxNumberOfProblems: 10 };
        const results = Validator.validateText(text, settings);
        return results.then(results => expect(results).to.be.lengthOf(10));
    });

    it('validates reserved words', () => {
        const text = 'constructor const prototype type typeof null undefined';
        const languageId = 'javascript';
        const settings = {...getSettings(text, languageId), maxNumberOfProblems: 10 };
        const results = Validator.validateText(text, settings);
        return results.then(results => expect(results).to.be.lengthOf(0));
    });

    it('validates regex inclusions/exclusions', () => {
        const text = sampleCode;
        const languageId = 'plaintext';
        const settings = {...getSettings(text, languageId), maxNumberOfProblems: 10 };
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(wo => wo.text);
            expect(words).to.contain('wrongg');
            expect(words).to.contain('mispelled');
            expect(words).to.not.contain('xaccd');
            expect(words).to.not.contain('ctrip');
            expect(words).to.not.contain('FFEE');
            expect(words).to.not.contain('nmove');
        });
    });

    it('validates ignoreRegExpList', () => {
        const text = sampleCode;
        const languageId = 'plaintext';
        const settings = {...getSettings(text, languageId), maxNumberOfProblems: 10, ignoreRegExpList: ['^const [wy]RON[g]+', 'mis.*led'] };
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(wo => wo.text);
            expect(words).to.not.contain('wrongg');
            expect(words).to.not.contain('mispelled');
            expect(words).to.contain('mischecked');
        });
    });

    it('validates ignoreRegExpList 2', () => {
        const results = Validator.validateText(
            sampleCode,
            { ignoreRegExpList: ['/^const [wy]ron[g]+/gim', '/MIS...LED/g', '/mischecked'] }
        );
        return results.then(results => {
            const words = results.map(wo => wo.text);
            expect(words).to.not.contain('wrongg');
            expect(words).to.contain('mispelled');
            expect(words).to.contain('mischecked');
        });
    });

    it('validates malformed ignoreRegExpList', () => {
        const results = Validator.validateText(sampleCode, { ignoreRegExpList: ['/wrong[/gim', 'mis.*led'] });
        return results.then(results => {
            const words = results.map(wo => wo.text);
            expect(words).to.contain('wrongg');
            expect(words).to.not.contain('mispelled');
            expect(words).to.contain('mischecked');
        });
    });
});

const sampleCode = `

// Verify urls do not get checked.
const url = 'http://ctrip.com?q=words';

// Verify hex values.
const value = 0xaccd;

/* spell-checker:disable */

const weirdWords = ['ctrip', 'xebia', 'zando', 'zooloo'];

/* spell-checker:enable */

const wrongg = 'mispelled';
const check = 'mischecked';
const message = "\\nmove to next line";

const hex = 0xBADC0FFEE;

`;