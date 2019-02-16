import { normalizeCode, isValidCode, lookupCode } from './index';

describe('Validation', () => {
    test('tests normalizeCode', () => {
        expect(normalizeCode('en')).toBe('en');
        expect(normalizeCode('en-US')).toBe('en-US');
        expect(normalizeCode('en-gb')).toBe('en-GB');
        expect(normalizeCode('en_US')).toBe('en-US');
        expect(normalizeCode('EN_us')).toBe('en-US');
        expect(normalizeCode('enUS')).toBe('en-US');
        expect(normalizeCode('bad-code')).toBe('bad-code');
        expect(normalizeCode('eses')).toBe('es-ES');
        expect(normalizeCode('walk')).toBe('wa-LK');
        expect(normalizeCode('four')).toBe('fo-UR');
    });

    test('tests isValidCode', () => {
        // 'en'
        expect(isValidCode('en')).toBe(true);
        // 'en-UK'
        expect(isValidCode('en-UK')).toBe(false);
        // 'en-GB'
        expect(isValidCode('en-GB')).toBe(true);
        // 'walk'
        expect(isValidCode('walk')).toBe(false);
    });

    test('tests lookupCode', () => {
        expect(lookupCode('')).toBeUndefined();
        expect(lookupCode('en')).toBeDefined();
        expect(lookupCode('en')!.lang).toBe('English');
        expect(lookupCode('en')!.code).toBe('en');
        expect(lookupCode('en')!.country).toBe('');
        expect(lookupCode('es_ES')).toBeUndefined();
        expect(lookupCode('es-ES')).toBeDefined();
        expect(lookupCode('es-ES')!.lang).toBe('Spanish');
        expect(lookupCode('es-ES')!.country).toBe('Spain');
    });
});