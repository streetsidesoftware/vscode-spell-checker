import { __testing__ } from './infoHelper';

const { splitBangPrefix, calcEnableLang, applyEnableFiletypesToEnabledLanguageIds } = __testing__;

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
});
