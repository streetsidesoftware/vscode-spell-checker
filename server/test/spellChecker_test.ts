import {expect} from 'chai';
import { isWordInDictionary } from '../src/spellChecker';

describe('Verify Spell Checker', () => {
    it('did load', () => {
        return isWordInDictionary('yes').then(isFound => {
            expect(isFound).to.be.true;
        });
    });

    it('will ignore case.', () => {
        return isWordInDictionary('netherlands').then(isFound => {
            expect(isFound).to.be.true;
        });
    });

});