import { hasWorkspaceLocation, addLocaleToCurrentLocale, removeLocaleFromCurrentLocale } from './settings';

describe('Validate settings.ts', () => {
    test('hasWorkspaceLocation', () => {
        expect(hasWorkspaceLocation()).toBe(false);
    });

    test.each`
        locale              | current | expected
        ${'en'}             | ${'en'} | ${'en'}
        ${'nl_nl'}          | ${'en'} | ${'en,nl-NL'}
        ${'nl,nl_nl,nl-Nl'} | ${'en'} | ${'en,nl,nl-NL'}
    `('addLocaleToCurrentLocale $locale + $current => $expected', ({ locale, current, expected }) => {
        expect(addLocaleToCurrentLocale(locale, current)).toBe(expected);
    });

    test.each`
        locale        | current       | expected
        ${'en'}       | ${'en'}       | ${undefined}
        ${'nl_nl'}    | ${'en'}       | ${'en'}
        ${'nl_nl'}    | ${'en,nl-NL'} | ${'en'}
        ${'nl,nl_nl'} | ${'en,nl'}    | ${'en'}
        ${'en;nl_nl'} | ${'en,nl'}    | ${'nl'}
        ${'en;nl_nl'} | ${'en, nl'}   | ${'nl'}
    `('removeLocaleFromCurrentLocale $current - $locale => $expected', ({ locale, current, expected }) => {
        expect(removeLocaleFromCurrentLocale(locale, current)).toBe(expected);
    });
});
