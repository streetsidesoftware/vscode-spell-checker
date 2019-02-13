import * as Validator from './validator';
const loremIpsum = require('lorem-ipsum');
import { CSpellSettings } from 'cspell';
import * as cspell from 'cspell';

import { getDefaultSettings } from 'cspell';

// cSpell:ignore brouwn jumpped lazzy wrongg mispelled ctrip nmove mischecked

const defaultSettings: CSpellSettings = { ...getDefaultSettings(), enabledLanguageIds: ['plaintext', 'javascript']};

function getSettings(text: string, languageId: string) {
    return cspell.constructSettingsForText(defaultSettings, text, languageId);
}

describe('Validator', () => {
    // this.timeout(5000);

    test('validates the validator', () => {
        const text = 'The quick brouwn fox jumpped over the lazzy dog.';
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(({text}) => text);
            expect(words).toEqual(['brouwn', 'jumpped', 'lazzy']);
        });
    });

    test('validates ignore Case', () => {
        const text = 'The Quick brown fox Jumped over the lazy dog.';
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(({text}) => text);
            expect(words).toEqual([]);
        });
    });

    test('validate limit', () => {
        const text = loremIpsum({ count: 5, unit: 'paragraphs' });
        const languageId = 'plaintext';
        const settings = {...getSettings(text, languageId), maxNumberOfProblems: 10 };
        const results = Validator.validateText(text, settings);
        return results.then(results => expect(results).toHaveLength(10));
    });

    test('validates reserved words', () => {
        const text = 'constructor const prototype type typeof null undefined';
        const languageId = 'javascript';
        const settings = {...getSettings(text, languageId), maxNumberOfProblems: 10 };
        const results = Validator.validateText(text, settings);
        return results.then(results => expect(results).toHaveLength(0));
    });

    test('validates regex inclusions/exclusions', () => {
        const text = sampleCode;
        const languageId = 'plaintext';
        const settings = {...getSettings(text, languageId), maxNumberOfProblems: 10 };
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(wo => wo.text);
            expect(words).toEqual(expect.arrayContaining(['wrongg']));
            expect(words).toEqual(expect.arrayContaining(['mispelled']));
            expect(words).toEqual(expect.not.arrayContaining(['xaccd']));
            expect(words).toEqual(expect.not.arrayContaining(['ctrip']));
            expect(words).toEqual(expect.not.arrayContaining(['FFEE']));
            expect(words).toEqual(expect.not.arrayContaining(['nmove']));
        });
    });

    test('validates ignoreRegExpList', () => {
        const text = sampleCode;
        const languageId = 'plaintext';
        const settings = {...getSettings(text, languageId), maxNumberOfProblems: 10, ignoreRegExpList: ['^const [wy]RON[g]+', 'mis.*led'] };
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(wo => wo.text);
            expect(words).toEqual(expect.not.arrayContaining(['wrongg']));
            expect(words).toEqual(expect.not.arrayContaining(['mispelled']));
            expect(words).toEqual(expect.arrayContaining(['mischecked']));
        });
    });

    test('validates ignoreRegExpList 2', () => {
        const results = Validator.validateText(
            sampleCode,
            { ignoreRegExpList: ['/^const [wy]ron[g]+/gim', '/MIS...LED/g', '/mischecked'] }
        );
        return results.then(results => {
            const words = results.map(wo => wo.text);
            expect(words).toEqual(expect.not.arrayContaining(['wrongg']));
            expect(words).toEqual(expect.arrayContaining(['mispelled']));
            expect(words).toEqual(expect.arrayContaining(['mischecked']));
        });
    });

    test('validates malformed ignoreRegExpList', () => {
        const results = Validator.validateText(sampleCode, { ignoreRegExpList: ['/wrong[/gim', 'mis.*led'] });
        return results.then(results => {
            const words = results.map(wo => wo.text);
            expect(words).toEqual(expect.arrayContaining(['wrongg']));
            expect(words).toEqual(expect.not.arrayContaining(['mispelled']));
            expect(words).toEqual(expect.arrayContaining(['mischecked']));
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