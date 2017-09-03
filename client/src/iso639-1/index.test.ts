import {expect} from 'chai';
import { normalizeCode, isValidCode, lookupCode } from './index';

describe('Validation', () => {
    it('tests normalizeCode', () => {
        expect(normalizeCode('en')).to.be.equal('en');
        expect(normalizeCode('en-US')).to.be.equal('en-US');
        expect(normalizeCode('en-gb')).to.be.equal('en-GB');
        expect(normalizeCode('en_US')).to.be.equal('en-US');
        expect(normalizeCode('EN_us')).to.be.equal('en-US');
        expect(normalizeCode('enUS')).to.be.equal('en-US');
        expect(normalizeCode('bad-code')).to.be.equal('bad-code');
        expect(normalizeCode('eses')).to.be.equal('es-ES');
        expect(normalizeCode('walk')).to.be.equal('wa-LK');
        expect(normalizeCode('four')).to.be.equal('fo-UR');
    });

    it('tests isValidCode', () => {
        expect(isValidCode('en'), 'en').to.be.true;
        expect(isValidCode('en-UK'), 'en-UK').to.be.false;
        expect(isValidCode('en-GB'), 'en-GB').to.be.true;
        expect(isValidCode('walk'), 'walk').to.be.false;
    });

    it('tests lookupCode', () => {
        expect(lookupCode('')).to.be.undefined;
        expect(lookupCode('en')).to.not.be.undefined;
        expect(lookupCode('en')!.lang).to.be.equal('English');
        expect(lookupCode('en')!.country).to.be.equal('');
        expect(lookupCode('es_ES')).to.be.undefined;
        expect(lookupCode('es-ES')).to.not.be.undefined;
        expect(lookupCode('es-ES')!.lang).to.be.equal('Spanish');
        expect(lookupCode('es-ES')!.country).to.be.equal('Spain');
    });
});