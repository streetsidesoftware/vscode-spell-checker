import { expect } from 'chai';
import * as server from './server';
import * as serverSettings from './serverSettings';

describe('Validate Server Settings', () => {
    it('Tests extracting dictionaries by local', () => {
        const langSetting: server.LanguageSetting[]  = [
            { local: 'en,en-US', languageId: '*', dictionaries: ['English'] },
            { local: 'en', languageId: '*', dictionaries: ['Misc'] },
            { local: 'fr', languageId: '*', dictionaries: ['French'] },
            { local: '*', languageId: 'java', dictionaries: ['Java'] },
        ];

        const locals = serverSettings.extractDictionariesByLocalLanguageSettings(langSetting);

        expect(locals.get('en')).to.be.not.null;
        expect(locals.get('en-GB')).to.be.undefined;
        expect(locals.get('en-US')).to.be.not.null;
        expect(locals.get('fr')).to.be.not.null;
        expect(locals.get('*')).to.be.not.null;
        expect(locals.get('en')).to.contain('English');
        expect(locals.get('en')).to.contain('Misc');
        expect(locals.get('en-US')).to.not.contain('Misc');
    });
});