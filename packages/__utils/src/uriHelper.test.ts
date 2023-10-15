import * as path from 'path';
import { URI as Uri, Utils as UriUtils } from 'vscode-uri';

import { cleanUri, isSupportedDoc, isSupportedUri, relativeTo, relativeToFile, toFileUri, toUri, uriToName } from './uriHelper';

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
        ${path.resolve('/file.js')}                      | ${Uri.file(path.resolve('/file.js'))}
    `('toFileUri $uri', ({ uri, expected }) => {
        expect(toFileUri(uri).toString()).toBe(expected.toString());
    });

    test.each`
        a                               | b                           | expected
        ${'file:///a/b/c/file.txt'}     | ${'file:///a/b/c/file.txt'} | ${''}
        ${'file:///a/b/'}               | ${'file:///a/b/c/file.txt'} | ${'c/file.txt'}
        ${'file:///a/b'}                | ${'file:///a/b/c/file.txt'} | ${'c/file.txt'}
        ${'file:///a/b/c/file.txt'}     | ${'file:///a/b/'}           | ${'../..'}
        ${'file:///a/b/c/file.txt'}     | ${'file:///a/b'}            | ${'../..'}
        ${'file:///a/b/c/file.txt#156'} | ${'file:///a/b?x=1;b=2'}    | ${'../..'}
        ${'file:///a/b/c/file.txt?x=1'} | ${'file:///a/b/c#55'}       | ${'..'}
    `('relativeTo "$a" "$b"', ({ a, b, expected }) => {
        const uriA = toUri(a);
        const uriB = toUri(b);
        const rel = relativeTo(uriA, uriB);
        expect(rel).toBe(expected);
        expect(UriUtils.joinPath(uriA, rel).toString()).toBe(
            UriUtils.joinPath(cleanUri(uriB), '.').with({ fragment: uriA.fragment, query: uriA.query }).toString(),
        );
    });

    test.each`
        a                               | b                                 | expected
        ${'file:///a/b/c/file.txt'}     | ${'file:///a/b/c/file.txt'}       | ${'file.txt'}
        ${'file:///a/b/'}               | ${'file:///a/b/c/file.txt'}       | ${'c/file.txt'}
        ${'file:///a/b'}                | ${'file:///a/b/c/file.txt'}       | ${'b/c/file.txt'}
        ${'file:///a/b/c/file.txt'}     | ${'file:///a/b/'}                 | ${'..'}
        ${'file:///a/b/c/file.txt'}     | ${'file:///a/b'}                  | ${'..'}
        ${'file:///a/b/c/file.txt'}     | ${'scm-input:///a/b/c/file.txt'}  | ${'scm-input:/a/b/c/file.txt'}
        ${'file:///a/b/c/file.txt'}     | ${'scm-input:///file.txt#header'} | ${'scm-input:/file.txt'}
        ${'file:///a/b/c/file.txt#156'} | ${'file:///a/b?x=1;b=2'}          | ${'..'}
        ${'file:///a/b/c/file.txt?x=1'} | ${'file:///a/b/c#55'}             | ${''}
    `('relativeToFile "$a" "$b"', ({ a, b, expected }) => {
        const uriA = toUri(a);
        const uriB = toUri(b);
        const rel = relativeToFile(uriA, uriB);
        expect(rel).toBe(expected);
    });

    test.each`
        uri                             | segments                             | expected
        ${'file:///a/b/c/file.txt'}     | ${undefined}                         | ${'c/file.txt'}
        ${'file:///a/b/'}               | ${undefined}                         | ${'a/b'}
        ${'file:///a/b'}                | ${undefined}                         | ${'a/b'}
        ${'file:///a/b/c/file.txt'}     | ${3}                                 | ${'b/c/file.txt'}
        ${'file:///a/b/c/file.txt'}     | ${1}                                 | ${'file.txt'}
        ${'file:///a/b/c/file.txt#156'} | ${undefined}                         | ${'c/file.txt'}
        ${'file:///a/b/c/file.txt?x=1'} | ${undefined}                         | ${'c/file.txt'}
        ${'file:///a/b/c/file.txt#156'} | ${{ relativeTo: 'file:///a/b/c/' }}  | ${'file.txt'}
        ${'file:///a/b/c/file.txt#156'} | ${{ relativeTo: 'stdin:///a/b/c/' }} | ${'c/file.txt'}
    `('uriToName "$uri" -> "$expected"', ({ uri, segments, expected }) => {
        const uriA = toUri(uri);
        expect(uriToName(uriA, typeof segments === 'number' ? { segments } : segments)).toBe(expected);
    });
});
