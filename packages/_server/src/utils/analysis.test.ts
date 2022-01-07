import {
    isTextLikelyMinified,
    IsTextLikelyMinifiedOptions,
    ReasonAverageWordsSize,
    ReasonLineLength,
    ReasonMaxWordsSize,
} from './analysis';
import * as FS from 'fs';
import * as Path from 'path';

const sampleWebpack = FS.readFileSync(Path.join(__dirname, '../../dist/main.js'), 'utf8');

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
        ${sampleText50().replace(/ /g, '-')}                             | ${{}} | ${ReasonAverageWordsSize}
        ${sampleText50().replace(/\s/g, ',')}                            | ${{}} | ${ReasonLineLength}
        ${sampleText200()}                                               | ${{}} | ${false}
        ${sampleText200().replace(/ /g, '-')}                            | ${{}} | ${ReasonAverageWordsSize}
        ${sampleText200().replace(/\s/g, ',')}                           | ${{}} | ${ReasonLineLength}
        ${sampleWebpack}                                                 | ${{}} | ${ReasonLineLength}
        ${[sampleText50(), sampleLongLine(), sampleText50()].join('\n')} | ${{}} | ${ReasonMaxWordsSize}
    `('isTextLikelyMinified $#', ({ text, opts, expected }) => {
        const options = Object.assign({}, defaultOptions, opts);
        expect(isTextLikelyMinified(text, options)).toBe(expected);
    });
});
