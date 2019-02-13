import * as server from './server';
import * as serverSettings from './serverSettings';

describe('Validate Server Settings', () => {
    test('Tests extracting dictionaries by local', () => {
        const langSetting: server.LanguageSetting[]  = [
            { local: 'en,en-US', languageId: '*', dictionaries: ['English'] },
            { local: 'en', languageId: '*', dictionaries: ['Misc'] },
            { local: 'fr', languageId: '*', dictionaries: ['French'] },
            { local: '*', languageId: 'java', dictionaries: ['Java'] },
        ];

        const locals = serverSettings.extractDictionariesByLocalLanguageSettings(langSetting);

        expect(locals.get('en')).not.toBeNull();
        expect(locals.get('en-GB')).toBeUndefined();
        expect(locals.get('en-US')).not.toBeNull();
        expect(locals.get('fr')).not.toBeNull();
        expect(locals.get('*')).not.toBeNull();
        expect(locals.get('en')).toEqual(expect.arrayContaining(['English']));
        expect(locals.get('en')).toEqual(expect.arrayContaining(['Misc']));
        expect(locals.get('en-US')).toEqual(expect.not.arrayContaining(['Misc']));
    });
});