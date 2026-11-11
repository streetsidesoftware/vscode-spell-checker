import type { CSpellSettings } from 'cspell-lib';
import * as cspell from 'cspell-lib';
import { getDefaultSettings } from 'cspell-lib';
import { loremIpsum } from 'lorem-ipsum';
import { describe, expect, test } from 'vitest';
import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';

import type { DocumentSettings } from './config/documentSettings.mjs';
import { DocumentCheckedRangesStore } from './DocumentCheckedRangesStore.mjs';
import { DocumentValidationController } from './DocumentValidationController.mjs';
import * as Validator from './validator.mjs';

// cSpell:ignore brouwn jumpped lazzy wrongg mispelled ctrip nmove mischecked

const defaultSettings: CSpellSettings = { ...(await getDefaultSettings()), enabledLanguageIds: ['plaintext', 'javascript'] };

const timeout = 30000; // 30 seconds

describe('Validator', () => {
    test.each([1000, '1KB'])('skips an oversized editor document with maxFileSize %s', async (maxFileSize) => {
        const text = 'The quick brouwn fox jumpped over the lazzy dog.\n' + 'The quick brown fox.\n'.repeat(35000);
        const doc = TextDocument.create('file:///example.txt', 'plaintext', 1, text);
        const results = await Validator.validateTextDocument(doc, { maxFileSize }, new DocumentCheckedRangesStore());
        expect(results).toEqual([]);
    });

    test.each([0, '0', undefined, '1M', '1MB', '1G', '1GB', 'invalid', '1TB'])(
        'checks documents below maxFileSize %s',
        async (maxFileSize) => {
            const doc = TextDocument.create('untitled:example.txt', 'plaintext', 1, 'The quick brouwn fox jumpped over the lazzy dog.');
            const results = await Validator.validateTextDocument(doc, { maxFileSize }, new DocumentCheckedRangesStore());
            expect(results).toHaveLength(3);
        },
    );

    test.each([1, '1', '1B', '0.001K', '0.001KB', '0.000001M', '0.000001MB', '0.000000001G', '0.000000001GB'])(
        'supports byte and fractional unit limits %s',
        async (maxFileSize) => {
            const doc = TextDocument.create('untitled:example.txt', 'plaintext', 1, 'The quick brouwn fox.');
            const results = await Validator.validateTextDocument(doc, { maxFileSize }, new DocumentCheckedRangesStore());
            expect(results).toEqual([]);
        },
    );

    test.each([-1, 0, 1])('compares the full UTF-8 byte length at threshold offset %s', async (offset) => {
        const text = 'brouwn é';
        const maxFileSize = Buffer.byteLength(text, 'utf8') + offset;
        const doc = TextDocument.create('file:///example.txt', 'plaintext', 1, text);
        const results = await Validator.validateTextDocument(doc, { maxFileSize }, new DocumentCheckedRangesStore());
        expect(results).toHaveLength(offset < 0 ? 0 : 1);
    });

    test('uses the size of the full document before applying checkLimit', async () => {
        const text = 'brouwn\n' + 'a '.repeat(1024);
        const doc = TextDocument.create('file:///example.txt', 'plaintext', 1, text);
        const results = await Validator.validateTextDocument(doc, { checkLimit: 1, maxFileSize: 1500 }, new DocumentCheckedRangesStore());
        expect(results).toEqual([]);
    });

    test.each`
        maximum | override | expected
        ${1}    | ${0}     | ${1}
        ${1}    | ${100}   | ${1}
        ${100}  | ${1}     | ${0}
    `('respects the effective maxFileSize override $override over $maximum', async ({ maximum, override, expected }) => {
        const doc = TextDocument.create('file:///example.txt', 'plaintext', 1, 'brouwn');
        const options = { maxFileSize: maximum, overrides: [{ filename: '**/*.txt', maxFileSize: override }] };
        const results = await Validator.validateTextDocument(doc, options, new DocumentCheckedRangesStore());
        expect(results).toHaveLength(expected);
    });

    test('continues applying checkLimit to documents below maxFileSize', async () => {
        const text = 'brouwn\n' + 'a '.repeat(1024) + '\njumpped';
        const doc = TextDocument.create('file:///example.txt', 'plaintext', 1, text);
        const results = await Validator.validateTextDocument(doc, { checkLimit: 1, maxFileSize: '1MB' }, new DocumentCheckedRangesStore());
        expect(results.map((diagnostic) => diagnostic.message)).toEqual(['"brouwn": Unknown word.']);
    });

    test('rechecks the size limit after editing a cached document', async () => {
        const settings = { maxFileSize: 20 };
        const documentSettings = { getSettings: async () => settings } as unknown as DocumentSettings;
        const controller = new DocumentValidationController(documentSettings, new TextDocuments(TextDocument));
        try {
            const document = TextDocument.create('file:///example.txt', 'plaintext', 1, 'brouwn');
            let validator = await controller.getDocumentValidator(document);
            expect(await validator.checkDocumentAsync(true)).toHaveLength(1);
            for (const text of ['brouwn ' + 'a '.repeat(20), 'brouwn']) {
                const updated = TextDocument.update(document, [{ text }], document.version + 1);
                await controller.updateDocument(updated);
                validator = await controller.getDocumentValidator(updated);
                expect(await validator.checkDocumentAsync(true)).toHaveLength(text.length > 20 ? 0 : 1);
            }
        } finally {
            controller.dispose();
        }
    });

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
            const uri = URI.parse(import.meta.url).toString();
            const textDoc = TextDocument.create(uri, languageId, 1, text);
            const documentCheckedRangesStore = new DocumentCheckedRangesStore();
            const results = await Validator.validateTextDocument(textDoc, settings, documentCheckedRangesStore);
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
