import { languages } from './languages';

describe('languages', () => {
    test('getLanguages', async () => {
        const langs = await languages.getLanguages();
        expect(langs).toBeDefined();
        expect(langs.length).toBeGreaterThan(1);
    });
});
