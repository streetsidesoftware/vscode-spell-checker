import type { CSpellSettings } from 'cspell-lib';
import * as cspell from 'cspell-lib';
import { getDefaultSettings } from 'cspell-lib';
import { loremIpsum } from 'lorem-ipsum';
import { describe, expect, test } from 'vitest';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';

import * as Validator from './validator.mjs';

// cSpell:ignore brouwn jumpped lazzy wrongg mispelled ctrip nmove mischecked

const defaultSettings: CSpellSettings = { ...getDefaultSettings(), enabledLanguageIds: ['plaintext', 'javascript'] };

const timeout = 30000; // 30 seconds

describe('Validator', () => {
    test(
        'validates the validator',
        async () => {
            const text = 'The quick brouwn fox jumpped over the lazzy dog.';
            const languageId = 'plaintext';
            const settings = getSettings(text, languageId);
            const results = await Validator.validateText(text, settings);
            const words = results.map(({ text }) => text);
            expect(words).toEqual(['brouwn', 'jumpped', 'lazzy']);
        },
        timeout,
    );

    test(
        'validates ignore Case',
        async () => {
            const text = 'The Quick brown fox Jumped over the lazy dog.';
            const languageId = 'plaintext';
            const settings = getSettings(text, languageId);
            const results = await Validator.validateText(text, settings);
            const words = results.map(({ text }) => text);
            expect(words).toEqual([]);
        },
        timeout,
    );

    test(
        'validate limit',
        async () => {
            const text = loremIpsum({ count: 5, units: 'paragraphs' });
            const languageId = 'plaintext';
            const settings = { ...getSettings(text, languageId), maxNumberOfProblems: 10 };
            const results = await Validator.validateText(text, settings);
            expect(results).toHaveLength(10);
        },
        timeout,
    );

    test(
        'validates reserved words',
        async () => {
            const text = 'constructor const prototype type typeof null undefined';
            const languageId = 'javascript';
            const settings = { ...getSettings(text, languageId), maxNumberOfProblems: 10 };
            const results = await Validator.validateText(text, settings);
            expect(results).toHaveLength(0);
        },
        timeout,
    );

    test(
        'validates regex inclusions/exclusions',
        async () => {
            const text = sampleCode;
            const languageId = 'plaintext';
            const settings = { ...getSettings(text, languageId), maxNumberOfProblems: 10 };
            const results = await Validator.validateText(text, settings);
            const words = results.map((wo) => wo.text);
            // cspell:ignore xaccd ffee
            expect(words).toEqual(expect.arrayContaining(['wrongg']));
            expect(words).toEqual(expect.arrayContaining(['mispelled']));
            expect(words).toEqual(expect.not.arrayContaining(['xaccd']));
            expect(words).toEqual(expect.not.arrayContaining(['ctrip']));
            expect(words).toEqual(expect.not.arrayContaining(['FFEE']));
            expect(words).toEqual(expect.not.arrayContaining(['nmove']));
        },
        timeout,
    );

    test(
        'validates ignoreRegExpList',
        async () => {
            const text = sampleCode;
            const languageId = 'plaintext';
            const settings = {
                ...getSettings(text, languageId),
                maxNumberOfProblems: 10,
                ignoreRegExpList: ['^const [wy]RON[g]+', 'mis.*led'],
            };
            const results = await Validator.validateText(text, settings);
            const words = results.map((wo) => wo.text);
            expect(words).toEqual(expect.not.arrayContaining(['wrongg']));
            expect(words).toEqual(expect.not.arrayContaining(['mispelled']));
            expect(words).toEqual(expect.arrayContaining(['mischecked']));
        },
        timeout,
    );

    test(
        'validates ignoreRegExpList 2',
        async () => {
            const results = await Validator.validateText(sampleCode, {
                ignoreRegExpList: ['/^const [wy]ron[g]+/gim', '/MIS...LED/g', '/mischecked'],
            });
            const words = results.map((wo) => wo.text);
            expect(words).toEqual(expect.not.arrayContaining(['wrongg']));
            expect(words).toEqual(expect.arrayContaining(['mispelled']));
            expect(words).toEqual(expect.arrayContaining(['mischecked']));
        },
        timeout,
    );

    test(
        'validates malformed ignoreRegExpList',
        async () => {
            const results = await Validator.validateText(sampleCode, { ignoreRegExpList: ['/wrong[/gim', 'mis.*led'] });
            const words = results.map((wo) => wo.text);
            expect(words).toEqual(expect.arrayContaining(['wrongg']));
            expect(words).toEqual(expect.not.arrayContaining(['mispelled']));
            expect(words).toEqual(expect.arrayContaining(['mischecked']));
        },
        timeout,
    );

    // cspell:ignore legacyy codez badcoffee
    const ignoreWords = ['bogus', 'legacyy-codez'];

    test.each`
        text                       | expected
        ${'hello there'}           | ${[]}
        ${'bogus musings'}         | ${[]}
        ${'writing legacyy-codez'} | ${[]}
        ${'badcoffee tastes good'} | ${[expect.objectContaining({ text: 'badcoffee', isFound: false })]}
    `(
        'validateText ignoreWords $text',
        async ({ text, expected }) => {
            const languageId = 'plaintext';
            const _settings = getSettings(text, languageId);
            const settings = { ..._settings, maxNumberOfProblems: 10, ignoreWords };
            const results = await Validator.validateText(text, settings, {});
            expect(results).toEqual(expected);
        },
        timeout,
    );

    test(
        'validateTextDocument',
        async () => {
            const text = sampleCode;
            const languageId = 'plaintext';
            const settings = { ...getSettings(text, languageId), maxNumberOfProblems: 10 };
            const uri = URI.file(__filename).toString();
            const textDoc = TextDocument.create(uri, languageId, 1, text);
            const results = await Validator.validateTextDocument(textDoc, settings);
            const words = results.map((diag) => diag.message);
            expect(words).toEqual(expect.arrayContaining([expect.stringContaining('wrongg')]));
            expect(words).toEqual(expect.arrayContaining([expect.stringContaining('mispelled')]));
            expect(words).toEqual(expect.not.arrayContaining([expect.stringContaining('xaccd')]));
            expect(words).toEqual(expect.not.arrayContaining([expect.stringContaining('ctrip')]));
            expect(words).toEqual(expect.not.arrayContaining([expect.stringContaining('FFEE')]));
            expect(words).toEqual(expect.not.arrayContaining([expect.stringContaining('nmove')]));
        },
        timeout,
    );
});

const sampleCode = `

// Verify urls do not get checked.
const url = 'http://ctrip.com?q=words';

// Verify hex values.
const value = 0xaccd;

/* spell-checker:disable */

const weirdWords = ['ctrip', 'xebia', 'zando', 'zooloo'];

/* spell-checker:enable */

const wrongg = 'mispelled';
const check = 'mischecked';
const message = "\\nmove to next line";

const hex = 0xBADC0FFEE;

`;

function getSettings(text: string, languageId: string) {
    return cspell.constructSettingsForText(defaultSettings, text, languageId);
}
