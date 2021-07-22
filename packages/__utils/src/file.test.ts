import { fileExists } from './file';
import { URI as Uri } from 'vscode-uri';

describe('Validate file', () => {
    test('fileExists', async () => {
        await expect(fileExists(Uri.file(__filename))).resolves.toBe(true);
        await expect(fileExists(Uri.file(__filename + '.not.found'))).resolves.toBe(false);
    });
});
