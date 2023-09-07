import type { CSpellSettings } from 'cspell-lib';
import { join } from 'path';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { addNodeWatchMockImplementation, asNodeWatchMock } from '../test/mock-node-watch.js';
import { watch } from '../utils/nodeWatch.cjs';
import { DictionaryWatcher } from './dictionaryWatcher.mjs';

vi.mock('node-watch');

const dictA = join(__dirname, 'dictA.txt');
const dictB = join(__dirname, 'dictB.txt');
const dictC = join(__dirname, 'dictC.txt');

const sampleConfig: CSpellSettings = {
    dictionaryDefinitions: [
        { name: 'dict A', path: dictA },
        { name: 'dict B', path: dictB },
        { name: 'dict C', path: dictC },
    ],
    dictionaries: ['dict A', 'dict B'],
};

describe('Validate Dictionary Watcher', () => {
    afterEach(() => {
        asNodeWatchMock(watch).__reset();
    });

    test('watching dictionaries', () => {
        const mockWatch = addNodeWatchMockImplementation(vi.mocked(watch));
        const dw = new DictionaryWatcher();

        const listener = vi.fn();

        const d = dw.listen(listener);
        dw.processSettings(sampleConfig);

        expect(dw.watchedFiles).toEqual([dictA, dictB]);

        mockWatch.__trigger('update', dictB);
        d.dispose();
        mockWatch.__trigger('update', dictB);

        // Just because a listener stopped, doesn't mean the files are not watched.
        expect(dw.watchedFiles).toEqual([dictA, dictB]);

        const dispose = dw.dispose;
        dispose();

        expect(dw.watchedFiles).toEqual([]);

        expect(mockWatch).toHaveBeenNthCalledWith(1, dictA, expect.any(Object), expect.any(Function));
        expect(mockWatch).toHaveBeenNthCalledWith(2, dictB, expect.any(Object), expect.any(Function));
        expect(mockWatch).toHaveBeenCalledTimes(2);

        expect(listener).toHaveBeenCalledWith('update', dictB);
        expect(listener).toHaveBeenCalledTimes(1);

        expect(mockWatch.__getWatchers().map((w) => w.isClosed())).toEqual([true, true]);
    });
});
