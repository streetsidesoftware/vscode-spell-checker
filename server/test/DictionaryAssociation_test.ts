import { expect } from 'chai';
import {DictionaryAssociation} from '../src/DictionaryAssociation';

describe('DictionaryAssociation', () => {
    it('test associations', () => {
        const da = new DictionaryAssociation('*', 'en', '$/..');

        expect(da.matchProgLang('javascript')).to.be.true;
        expect(da.matchSpokenLang('en')).to.be.true;
        expect(da.match('typescript', 'en')).to.be.true;
        expect(da.match('typescript', 'fr')).to.be.false;
    });

    it('test null spoken lang', () => {
        const da = new DictionaryAssociation('@(php|html|*react)', null, '$/..');
        expect(da.matchProgLang('javascript')).to.be.false;
        expect(da.matchProgLang('php')).to.be.true;
        expect(da.matchProgLang('javascriptreact')).to.be.true;
        expect(da.matchSpokenLang('en')).to.be.true;
        expect(da.matchSpokenLang('fr')).to.be.true;
        expect(da.match('php', 'en')).to.be.true;
        expect(da.match('html', 'fr')).to.be.true;
    });

    it('test typescript/javascript lang', () => {
        const da = new DictionaryAssociation('@(typescript|javascript)?(react)', null, '$/..');
        expect(da.matchProgLang('javascript')).to.be.true;
        expect(da.matchProgLang('php')).to.be.false;
        expect(da.matchProgLang('javascriptreact')).to.be.true;
        expect(da.matchSpokenLang('en')).to.be.true;
        expect(da.matchSpokenLang('fr')).to.be.true;
        expect(da.match('typescript', 'en')).to.be.true;
        expect(da.match('react', 'fr')).to.be.false;
    });
});
