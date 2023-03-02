import { getScriptInfo, isValidCode, lookupLocaleInfo, normalizeCode, parseLocale } from './index';

describe('Validation', () => {
    test.each`
        code             | expected
        ${'en'}          | ${'en'}
        ${'en-US'}       | ${'en-US'}
        ${'en-gb'}       | ${'en-GB'}
        ${'en_US'}       | ${'en-US'}
        ${'EN_us'}       | ${'en-US'}
        ${'enUS'}        | ${'en-US'}
        ${'bad-code'}    | ${'bad-code'}
        ${'lorem-ipsum'} | ${'lorem-ipsum'}
        ${'lorem'}       | ${'lorem'}
        ${'eses'}        | ${'es-ES'}
        ${'walk'}        | ${'wa-LK'}
        ${'four'}        | ${'fo-UR'}
    `('normalizeCode $code', ({ code, expected }) => {
        const r = normalizeCode(code);
        expect(r).toBe(expected);
    });

    test.each`
        code             | expected
        ${'en'}          | ${'en'}
        ${'en-US'}       | ${'en-US'}
        ${'en-gb'}       | ${'en-GB'}
        ${'en_US'}       | ${'en-US'}
        ${'EN_us'}       | ${'en-US'}
        ${'enUS'}        | ${'en-US'}
        ${'bad-code'}    | ${undefined}
        ${'lorem-ipsum'} | ${'lorem-ipsum'}
        ${'lorem'}       | ${'lorem'}
        ${'eses'}        | ${'es-ES'}
        ${'walk'}        | ${'wa-LK'}
        ${'four'}        | ${'fo-UR'}
    `('normalizeCode $code', ({ code, expected }) => {
        const r = normalizeCode(code, true);
        expect(r).toBe(expected);
    });

    test.each`
        code       | expected
        ${'en'}    | ${'en'}
        ${'en-US'} | ${'en-US'}
        ${'en-gb'} | ${'en-GB'}
        ${'en_US'} | ${'en-US'}
        ${'EN_us'} | ${'en-US'}
        ${'enUS'}  | ${'en-US'}
        ${'eses'}  | ${'es-ES'}
        ${'walk'}  | ${'wa-LK'}
        ${'four'}  | ${'fo-UR'}
    `('normalizeCode $code', ({ code, expected }) => {
        const r = normalizeCode(code);
        expect(r).toBe(expected);
        const locale = new Intl.Locale(r);
        expect(r).toBe(locale.toString());
    });

    test.each`
        code       | expected
        ${'en'}    | ${true}
        ${'en-UK'} | ${false}
        ${'en-US'} | ${true}
        ${'en-GB'} | ${true}
        ${'walk'}  | ${false}
    `('isValidCode $code', ({ code, expected }) => {
        expect(isValidCode(code)).toBe(expected);
    });

    test.each`
        code             | expected
        ${''}            | ${undefined}
        ${'en'}          | ${{ code: 'en', country: '', locale: '', lang: 'en', language: 'English' }}
        ${'en-GB'}       | ${{ code: 'en-GB', country: 'United Kingdom', locale: 'GB', lang: 'en', language: 'English' }}
        ${'es_ES'}       | ${{ code: 'es-ES', lang: 'es', locale: 'ES', country: 'Spain', language: 'Spanish' }}
        ${'es-ES'}       | ${{ code: 'es-ES', lang: 'es', locale: 'ES', country: 'Spain', language: 'Spanish' }}
        ${'lorem-ipsum'} | ${{ code: 'lorem-ipsum', lang: 'lorem-ipsum', locale: '', country: '', language: 'Lorem-Ipsum' }}
        ${'lorem'}       | ${{ code: 'lorem', lang: 'lorem', locale: '', country: '', language: 'Lorem-Ipsum' }}
    `('lookupCode $code', ({ code, expected }) => {
        expect(lookupLocaleInfo(code)).toEqual(expected);
    });

    test.each`
        code      | expected
        ${'en'}   | ${undefined}
        ${'LATN'} | ${{ script: 'Latn', scriptName: 'Latin' }}
        ${'cyrl'} | ${{ script: 'Cyrl', scriptName: 'Cyrillic' }}
    `('lookUpScriptCode $code', ({ code, expected }) => {
        expect(getScriptInfo(code)).toEqual(expected);
    });

    test.each`
        code            | expected
        ${'en'}         | ${{ lang: 'en', locale: '', script: '' }}
        ${'en-US'}      | ${{ lang: 'en', locale: 'US', script: '' }}
        ${'en-GB'}      | ${{ lang: 'en', locale: 'GB', script: '' }}
        ${'walk'}       | ${{ lang: 'wa', locale: 'LK', script: '' }}
        ${'lorem'}      | ${{ lang: 'lorem', locale: '', script: '' }}
        ${'loremIpsum'} | ${{ lang: 'lorem-ipsum', locale: '', script: '' }}
        ${'sr-Cyrl-rs'} | ${{ lang: 'sr', locale: 'RS', script: 'Cyrl' }}
    `('isValidCode $code', ({ code, expected }) => {
        expect(parseLocale(code)).toEqual(expected);
    });
});
