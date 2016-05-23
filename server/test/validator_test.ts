import {expect} from 'chai';
import * as Validator from '../src/validator';

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


});