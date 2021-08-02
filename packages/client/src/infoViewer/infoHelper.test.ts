import { __testing__ } from './infoHelper';
import * as cspell from 'cspell-lib';
import { isDefined } from '../util';

const { applyEnableFiletypesToEnabledLanguageIds, calcEnableLang, extractDictionariesFromConfig, normalizeLocales, splitBangPrefix } =
    __testing__;

describe('infoHelper', () => {
    test.each`
        value          | expected
        ${''}          | ${['', '']}
        ${'cpp'}       | ${['', 'cpp']}
        ${'!cpp'}      | ${['!', 'cpp']}
        ${'!!!!!cpp!'} | ${['!!!!!', 'cpp!']}
        ${'!cpp\n!'}   | ${['!', 'cpp\n!']}
    `('splitBangPrefix $value', ({ value, expected }) => {
        expect(splitBangPrefix(value)).toEqual(expected);
    });

    test.each`
        value       | expected
        ${''}       | ${{ enable: true, lang: '' }}
        ${'cpp'}    | ${{ enable: true, lang: 'cpp' }}
        ${'!cpp'}   | ${{ enable: false, lang: 'cpp' }}
        ${'!!cpp'}  | ${{ enable: true, lang: 'cpp' }}
        ${'!!!cpp'} | ${{ enable: false, lang: 'cpp' }}
    `('calcEnableLang $value', ({ value, expected }) => {
        expect(calcEnableLang(value)).toEqual(expected);
    });

    test.each`
        languageIds         | enableFiletypes | expected
        ${[]}               | ${[]}           | ${[]}
        ${['cpp']}          | ${['!cpp']}     | ${[]}
        ${['!cpp']}         | ${['!!cpp']}    | ${['cpp']}
        ${['!cpp', 'js']}   | ${['!!cpp']}    | ${['cpp', 'js']}
        ${['!!!cpp', 'js']} | ${['!!cpp']}    | ${['js']}
    `('applyEnableFiletypesToEnabledLanguageIds $languageIds, $enableFiletypes', ({ languageIds, enableFiletypes, expected }) => {
        expect(applyEnableFiletypesToEnabledLanguageIds(languageIds, enableFiletypes)).toEqual(expected);
    });

    test.each`
        locale                | expected
        ${''}                 | ${[]}
        ${'en-US, en_GB'}     | ${['en-US', 'en_GB']}
        ${'en-US;nl'}         | ${['en-US', 'nl']}
        ${['en-US;nl', 'es']} | ${['en-US', 'nl', 'es']}
    `('normalizeLocales $locale', ({ locale, expected }) => {
        expect(normalizeLocales(locale)).toEqual(expected);
    });

    test('extractDictionariesFromConfig', async () => {
        const cfg = await sampleCSpellSettings();
        expect(extractDictionariesFromConfig(cfg)).toEqual(
            expect.arrayContaining([
                {
                    description: 'American English Dictionary',
                    languageIds: [],
                    locales: ['en', 'en-US'],
                    name: 'en_us',
                },
                {
                    description: 'Lorem-ipsum dictionary for cspell.',
                    languageIds: [],
                    locales: ['lorem', 'lorem-ipsum'],
                    name: 'lorem-ipsum',
                },
                {
                    description: undefined,
                    languageIds: [],
                    locales: [],
                    name: 'cspell-words',
                    uri: expect.stringContaining('cspell-words.txt'),
                    uriName: expect.stringContaining('cspell-words.txt'),
                },
            ])
        );
    });

    test('extractDictionariesFromConfig undefined', async () => {
        expect(extractDictionariesFromConfig(undefined)).toEqual([]);
    });
});

async function sampleCSpellSettings() {
    const localCfg = await cspell.searchForConfig(__filename);
    const settings = [cspell.getDefaultSettings(), cspell.getGlobalSettings(), localCfg].filter(isDefined);
    return cspell.mergeSettings(settings[0], ...settings.slice(1));
}
