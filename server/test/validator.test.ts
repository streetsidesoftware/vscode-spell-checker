import {expect} from 'chai';
import * as Validator from '../src/validator';
const loremIpsum = require('lorem-ipsum');

import { getDefaultSettings } from '../src/DefaultSettings';

const defaultSettings = getDefaultSettings();

describe('Validator', () => {
    it('validates the validator', () => {
        const results = Validator.validateText('The quick brouwn fox jumpped over the lazzy dog.', 'plaintext', defaultSettings);
        return results.then(results => {
            const words = results.map(({word}) => word);
            expect(words).to.be.deep.equal(['brouwn', 'jumpped', 'lazzy']);
        });
    });

    it('validates ignore Case', () => {
        const results = Validator.validateText('The Quick brown fox Jumped over the lazy dog.', 'plaintext', defaultSettings)
        return results.then(results => {
            const words = results.map(({word}) => word);
            expect(words).to.be.deep.equal([]);
        });
    });

    it('validate limit', () => {
        const results = Validator.validateText(
            loremIpsum({ count: 5, unit: 'paragraphs' }),
            'plaintext',
            {...defaultSettings, maxNumberOfProblems: 10 }
        );
        return results.then(results => expect(results).to.be.lengthOf(10));
    });

    it('validates reserved words', () => {
        const results = Validator.validateText(
            'constructor const prototype type typeof null undefined',
            'javascript',
            {...defaultSettings, maxNumberOfProblems: 10 }
        );
        return results.then(results => expect(results).to.be.lengthOf(0));
    });

    it('validates regex inclusions/exclusions', () => {
        const results = Validator.validateText(sampleCode, 'plaintext', defaultSettings);
        return results.then(results => {
            const words = results.map(wo => wo.word);
            expect(words).to.contain('wrongg');
            expect(words).to.contain('mispelled');
            expect(words).to.not.contain('xaccd');
            expect(words).to.not.contain('ctrip');
            expect(words).to.not.contain('FFEE');
            expect(words).to.not.contain('nmove');
        });
    });

    it('validates ignoreRegExpList', () => {
        const results = Validator.validateText(sampleCode, 'plaintext', { ignoreRegExpList: ['^const [wy]RON[g]+', 'mis.*led'] });
        return results.then(results => {
            const words = results.map(wo => wo.word);
            expect(words).to.not.contain('wrongg');
            expect(words).to.not.contain('mispelled');
            expect(words).to.contain('mischecked');
        });
    });

    it('validates ignoreRegExpList 2', () => {
        const results = Validator.validateText(
            sampleCode,
            'plaintext',
            { ignoreRegExpList: ['/^const [wy]ron[g]+/gim', '/MIS...LED/g', '/mischecked'] }
        );
        return results.then(results => {
            const words = results.map(wo => wo.word);
            expect(words).to.not.contain('wrongg');
            expect(words).to.contain('mispelled');
            expect(words).to.contain('mischecked');
        });
    });


    it('validates malformed ignoreRegExpList', () => {
        const results = Validator.validateText(sampleCode, 'plaintext', { ignoreRegExpList: ['/wrong[/gim', 'mis.*led'] });
        return results.then(results => {
            const words = results.map(wo => wo.word);
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