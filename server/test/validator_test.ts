import {expect} from 'chai';
import * as Validator from '../src/validator';
const loremIpsum = require('lorem-ipsum');

describe('Validator', () => {
    it('validates the validator', () => {
        return Validator.validateText('The quick brouwn fox jumpped over the lazzy dog.')
            .map(({word}) => word)
            .toArray()
            .toPromise()
            .then(results => {
                expect(results).to.be.deep.equal(['brouwn', 'jumpped', 'lazzy']);
            });
    });

    it('validate limit', () => {
        return Validator.validateText(
            loremIpsum({ count: 5, unit: 'paragraphs' }),
            { maxNumberOfProblems: 10 }
        )
        .toArray()
        .toPromise()
        .then(results => {
            expect(results).to.be.lengthOf(10);
        });
    });

    it('validates reserved words', () => {
        return Validator.validateText(
            'constructor const prototype type typeof null undefined',
            { maxNumberOfProblems: 10 }
        )
        .toArray()
        .toPromise()
        .then(results => {
            expect(results).to.be.lengthOf(0);
        });
    });

    it('validates regex inclusions/exclusions', () => {
        return Validator.validateText(sampleCode)
        .toArray()
        .toPromise()
        .then(results => {
            const words = results.map(wo => wo.word);
            expect(words).to.contain('wrongg');
            expect(words).to.contain('mispelled');
            expect(words).to.not.contain('xaccd');
            expect(words).to.not.contain('ctrip');
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

`;