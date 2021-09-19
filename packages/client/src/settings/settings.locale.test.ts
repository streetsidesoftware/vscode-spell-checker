import { __testing__ } from './settings.locale';

const { addLocaleToCurrentLocale, removeLocaleFromCurrentLocale, doLocalesIntersect, isLocaleSubsetOf } = __testing__;

describe('Validate settings.ts', () => {
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

    test.each`
        locale        | current       | expected
        ${'en'}       | ${'en'}       | ${true}
        ${'nl_nl'}    | ${'en'}       | ${false}
        ${'nl_nl'}    | ${'en,nl-NL'} | ${true}
        ${'nl,nl_nl'} | ${'en,nl'}    | ${true}
        ${'en;nl_nl'} | ${'en,nl'}    | ${true}
        ${'en;nl_nl'} | ${'en, nl'}   | ${true}
    `('doLocalesIntersect $current ⋂ $locale => $expected', ({ locale, current, expected }) => {
        expect(doLocalesIntersect(locale, current)).toBe(expected);
    });

    test.each`
        locale        | current        | expected
        ${'en'}       | ${'en'}        | ${true}
        ${'nl_nl'}    | ${'en'}        | ${false}
        ${'nl_nl'}    | ${'en,nl-NL'}  | ${true}
        ${'nl,nl_nl'} | ${'en,nl'}     | ${false}
        ${'en;nl_nl'} | ${'en,nl'}     | ${false}
        ${'en;nl_nl'} | ${'nl-nl, en'} | ${true}
        ${'en;nl_nl'} | ${'en, nl'}    | ${false}
    `('doLocalesIntersect $locale ⊆ $current => $expected', ({ locale, current, expected }) => {
        expect(isLocaleSubsetOf(locale, current)).toBe(expected);
    });
});
