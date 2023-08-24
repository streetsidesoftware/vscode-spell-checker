import { loadConfig } from 'cspell-lib';
import * as fs from 'fs/promises';
import * as path from 'path';
import { beforeAll, describe, expect, test } from 'vitest';

import { ConfigWatcher } from './configWatcher.mjs';

const folderDir = path.resolve(__dirname, '../..');
const sampleFilesDir = path.resolve(folderDir, 'sampleSourceFiles');
const tempDir = path.resolve(folderDir, 'temp');

describe('Validate Config Watcher', () => {
    beforeAll(async () => {
        await fs.mkdir(tempDir, { recursive: true });
    });

    test('Collect sources from sample config', async () => {
        const settings = mustBeDefined(await loadConfig(path.resolve(sampleFilesDir, 'cSpell.json')));
        const configWatcher = new ConfigWatcher();
        configWatcher.processSettings(settings);
        expect(configWatcher.watchedFiles).toEqual(expect.arrayContaining(['cSpell.json'].map((f) => path.resolve(sampleFilesDir, f))));
    });
});

function mustBeDefined<T>(t: T | undefined): T {
    if (t === undefined) {
        throw new Error('undefined');
    }
    return t;
}
