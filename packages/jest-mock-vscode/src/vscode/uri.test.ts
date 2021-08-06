import { Uri, isUri } from './uri';
import { Utils as UriUtils } from 'vscode-uri';
import * as Path from 'path';

describe('uri', () => {
    test('joinPath', () => {
        const uDir = Uri.file(__dirname);
        const basename = Path.basename(__filename);
        const uFile = Uri.file(__filename);
        expect(Uri.joinPath(uDir, basename)).toEqual(uFile);
    });

    test.each`
        uri                                                   | expected
        ${{}}                                                 | ${false}
        ${undefined}                                          | ${false}
        ${'file'}                                             | ${false}
        ${Uri.file(__filename)}                               | ${true}
        ${Uri.file(__dirname)}                                | ${true}
        ${UriUtils.joinPath(Uri.file(__dirname), 'file.txt')} | ${true}
    `('isUri $uri', ({ uri, expected }) => {
        expect(isUri(uri)).toBe(expected);
    });
});
