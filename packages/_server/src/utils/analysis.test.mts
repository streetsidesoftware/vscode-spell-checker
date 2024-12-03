import * as FS from 'fs';
import * as Path from 'path';
import { describe, expect, test } from 'vitest';

import type { IsTextLikelyMinifiedOptions } from './analysis.mjs';
import { hydrateReason, isTextLikelyMinified, ReasonAverageWordsSize, ReasonLineLength, ReasonMaxWordsSize } from './analysis.mjs';

const sampleWebpack = FS.readFileSync(Path.join(__dirname, '../../dist/main.cjs'), 'utf8').replace(/\n/g, ' ');

const defaultOptions: IsTextLikelyMinifiedOptions = {
    blockCheckingWhenLineLengthGreaterThan: 1000,
    blockCheckingWhenAverageChunkSizeGreaterThan: 40,
    blockCheckingWhenTextChunkSizeGreaterThan: 180,
};

//cspell:dictionaries lorem-ipsum

const lines = [
    'Commodo ex ex sit ad. Ex esse aliqua excepteur in aliqua amet sunt. Culpa non non esse est incididunt ullamco est Lorem',
    'est pariatur. Ullamco ex est nisi id veniam laboris consectetur velit. Eu tempor deserunt tempor anim. Aute culpa id dolor',
    'ea commodo labore enim. Pariatur sit consequat qui nostrud ullamco adipisicing dolore consequat ad mollit culpa excepteur',
    'est pariatur. Ullamco ex est nisi id veniam laboris consectetur velit. Eu tempor deserunt tempor anim. Aute culpa id dolor',
    'reprehenderit. eu nulla do Lorem mollit ut incididunt excepteur. Labore voluptate ex est occaecat. Proident laborum incididunt',
    'ad officia ea sint commodo pariatur. Adipisicing in cupidatat laboris excepteur tempor exercitation amet reprehenderit ipsum ad qui.',
    'reprehenderit. eu nulla do Lorem mollit ut incididunt excepteur. Labore voluptate ex est occaecat. Proident laborum incididunt',
    'Adipisicing irure nisi enim ipsum mollit culpa officia do pariatur adipisicing. In sint esse quis do velit sint commodo sit labore',
    'commodo quis. Dolore Lorem quis ullamco incididunt cupidatat ex duis dolore officia.',
    'Image: [long url](https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/29e25571-eb24-4381-9a2d-bde0ba52be2e/df3uxma-90078aec-' +
        'f043-423b-8adf-68b0db323607.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQ' +
        'xNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzI5ZTI1NTcxLWViM' +
        'jQtNDM4MS05YTJkLWJkZTBiYTUyYmUyZVwvZGYzdXhtYS05MDA3OGFlYy1mMDQzLTQyM2ItOGFkZi02OGIwZGIzMjM2MDcucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ' +
        '2aWNlOmZpbGUuZG93bmxvYWQiXX0.Pap7EkIxDlgZ1dFLyEK_MOlPIQGjvJVm5T8adKtnAn0)', // cspell:disable-line
];

const longLine = lines.slice(0, 5).join(' ');

function sampleText50() {
    return genSampleParagraphs(50);
}
function sampleText200() {
    return genSampleParagraphs(200);
}
function sampleLongLine() {
    return genSampleLongLine().replace(/\s/g, '-');
}
function sampleLines200() {
    return genLines(200);
}

const sampleText = `
# Weekly Report

Image: [long url](https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/\
29e25571-eb24-4381-9a2d-bde0ba52be2e/df3uxma-90078aec-f043-423b-8adf-68b0db323607.png?\
token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNh\
NWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCI\
sIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzI5ZTI1NTcxLWViMjQtNDM4MS05YTJkLWJkZTBiYTUyYmUyZVwvZGYzdX\
htYS05MDA3OGFlYy1mMDQzLTQyM2ItOGFkZi02OGIwZGIzMjM2MDcucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2a\
WNlOmZpbGUuZG93bmxvYWQiXX0.Pap7EkIxDlgZ1dFLyEK_MOlPIQGjvJVm5T8adKtnAn0)

See VS Code Setting: [cSpell.blockCheckingWhenTextChunkSizeGreaterThan](vscode://settings/cSpell.blockCheckingWhenTextChunkSizeGreaterThan)

This file is expected to be checked.

Possible very long word:
token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNh\
NWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCI\
sIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzI5ZTI1NTcxLWViMjQtNDM4MS05YTJkLWJkZTBiYTUyYmUyZVwvZGYzdX\
htYS05MDA3OGFlYy1mMDQzLTQyM2ItOGFkZi02OGIwZGIzMjM2MDcucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2a\
WNlOmZpbGUuZG93bmxvYWQiXX0.Pap7EkIxDlgZ1dFLyEK_MOlPIQGjvJVm5T8adKtnAn0
`;

function genSampleParagraphs(count: number) {
    const paragraph1 = lines.slice(0, 3).join(' ');
    const paragraph2 = lines.slice(3, 8).join(' ');
    const paragraph3 = lines.slice(7).join(' ');
    return joinSamples(count, [paragraph1, paragraph2, paragraph3, paragraph2, paragraph3, paragraph1]);
}

function genLines(count: number) {
    return joinSamples(count, lines);
}

function joinSamples(count: number, samples: string[]): string {
    const parts: string[] = [];

    for (let i = 0, j = 0; i < count; ++i, j = (j + 1) % samples.length) {
        parts.push(samples[j]);
    }

    return parts.join('\n');
}

function genSampleLongLine() {
    return longLine;
}

describe('analysis', () => {
    test.each`
        text                                                             | opts  | expected
        ${''}                                                            | ${{}} | ${false}
        ${'\n\n'}                                                        | ${{}} | ${false}
        ${'{}'}                                                          | ${{}} | ${false}
        ${'{}\n'}                                                        | ${{}} | ${false}
        ${sampleText50()}                                                | ${{}} | ${false}
        ${sampleLines200()}                                              | ${{}} | ${false}
        ${sampleText50().replace(/ /g, '-')}                             | ${{}} | ${hydrateReason(ReasonAverageWordsSize, 40)}
        ${sampleText50().replace(/\s/g, ',')}                            | ${{}} | ${hydrateReason(ReasonLineLength, 1000)}
        ${sampleText200()}                                               | ${{}} | ${false}
        ${sampleText200().replace(/ /g, '-')}                            | ${{}} | ${hydrateReason(ReasonAverageWordsSize, 40)}
        ${sampleText200().replace(/\s/g, ',')}                           | ${{}} | ${hydrateReason(ReasonLineLength, 1000)}
        ${sampleWebpack}                                                 | ${{}} | ${hydrateReason(ReasonLineLength, 1000)}
        ${[sampleText50(), sampleLongLine(), sampleText50()].join('\n')} | ${{}} | ${hydrateReason(ReasonMaxWordsSize, 180)}
        ${sampleText}                                                    | ${{}} | ${hydrateReason(ReasonMaxWordsSize, 180)}
    `('isTextLikelyMinified $text', ({ text, opts, expected }) => {
        const options = Object.assign({}, defaultOptions, opts);
        expect(isTextLikelyMinified(text, options)).toEqual(expected);
    });
});
