import { isSupportedDoc, isSupportedUri, toFileUri, toUri } from './uriHelper';
import { Uri } from 'vscode';

const uri = Uri.file(__filename);

describe('Validate uriHelper', () => {
    test.each`
        doc                         | expected
        ${undefined}                | ${false}
        ${{ isClosed: false, uri }} | ${true}
        ${{ isClosed: true, uri }}  | ${false}
    `('isSupportedDoc $doc', ({ doc, expected }) => {
        expect(isSupportedDoc(doc)).toBe(expected);
    });

    test.each`
        uri                                              | expected
        ${undefined}                                     | ${false}
        ${uri}                                           | ${true}
        ${Uri.parse('http://www.streetsidesoftware.nl')} | ${false}
    `('isSupportedUri $uri', ({ uri, expected }) => {
        expect(isSupportedUri(uri)).toBe(expected);
    });

    test.each`
        uri                                              | expected
        ${uri}                                           | ${uri}
        ${'http://www.streetsidesoftware.nl'}            | ${'http://www.streetsidesoftware.nl/'}
        ${Uri.parse('http://www.streetsidesoftware.nl')} | ${'http://www.streetsidesoftware.nl/'}
    `('toUri $uri', ({ uri, expected }) => {
        expect(toUri(uri).toString()).toBe(expected.toString());
    });

    test.each`
        uri                                              | expected
        ${uri}                                           | ${uri}
        ${'http://www.streetsidesoftware.nl'}            | ${'http://www.streetsidesoftware.nl/'}
        ${Uri.parse('http://www.streetsidesoftware.nl')} | ${'http://www.streetsidesoftware.nl/'}
        ${__filename}                                    | ${Uri.file(__filename)}
    `('toFileUri $uri', ({ uri, expected }) => {
        expect(toFileUri(uri).toString()).toBe(expected.toString());
    });
});
