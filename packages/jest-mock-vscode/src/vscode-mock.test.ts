// import * as vscode from 'vscode';
import * as vscodeMock from './index';
import * as path from 'path';

describe('Validate Mock', () => {
    it('vscodeMock.Uri', () => {
        const uri = vscodeMock.Uri.file(__filename);
        const uriDir = vscodeMock.Uri.file(__dirname);
        const joined = vscodeMock.Uri.joinPath(uriDir, path.basename(__filename));
        expect(joined.toString()).toBe(uri.toString());
    });
});
