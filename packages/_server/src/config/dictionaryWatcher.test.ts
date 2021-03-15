import { CSpellSettings } from 'cspell-lib';
import { join } from 'path';
import { DictionaryWatcher } from './dictionaryWatcher';
import watch from 'node-watch';
import { NodeWatchMock } from '../__mocks__/node-watch';

const mockWatch = (watch as unknown) as NodeWatchMock;

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
    beforeEach(() => {
        mockWatch.__reset();
    });

    test('watching dictionaries', () => {
        const dw = new DictionaryWatcher();

        const listener = jest.fn();

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
