import watch from 'node-watch';
import { FileWatcher } from './fileWatcher';
import { NodeWatchMock } from '../__mocks__/node-watch';

const mockWatch = watch as unknown as NodeWatchMock;

describe('Validate FileWatcher', () => {
    beforeEach(() => {
        mockWatch.__reset();
    });

    test('', () => {
        const watcher = new FileWatcher();
        const listener = jest.fn();
        const listener2 = jest.fn();
        const dListener = watcher.listen(listener);
        watcher.addFile('file1');
        watcher.addFile('file2');
        watcher.addFile('file3');

        // Add the same file twice
        watcher.addFile('file2');

        expect(watcher.watchedFiles).toEqual(['file1', 'file2', 'file3']);

        mockWatch.__trigger('update', 'file1');
        mockWatch.__trigger('update', 'file2');
        watcher.listen(listener2);
        mockWatch.__trigger('remove', 'file2');

        // stop watching file1
        watcher.clearFile('file1');
        mockWatch.__trigger('update', 'file1');

        expect(watcher.watchedFiles).toEqual(['file2', 'file3']);

        // just for fun
        watcher.clearFile('file1');

        dListener.dispose();
        // trigger again to see if the listener was called.
        mockWatch.__trigger('update', 'file3');
        watcher.dispose();

        expect(watcher.watchedFiles).toEqual([]);

        expect(mockWatch).toHaveBeenNthCalledWith(1, 'file1', expect.objectContaining({ persistent: false }), expect.any(Function));
        expect(mockWatch).toHaveBeenNthCalledWith(2, 'file2', expect.objectContaining({ persistent: false }), expect.any(Function));
        expect(mockWatch).toHaveBeenNthCalledWith(3, 'file3', expect.objectContaining({ persistent: false }), expect.any(Function));
        expect(mockWatch).toHaveBeenCalledTimes(3);

        expect(listener).toHaveBeenNthCalledWith(1, 'update', 'file1');
        expect(listener).toHaveBeenNthCalledWith(2, 'update', 'file2');
        expect(listener).toHaveBeenNthCalledWith(3, 'remove', 'file2');
        expect(listener).toHaveBeenCalledTimes(3);

        expect(listener2).toHaveBeenNthCalledWith(1, 'remove', 'file2');
        expect(listener2).toHaveBeenNthCalledWith(2, 'update', 'file3');
        expect(listener2).toHaveBeenCalledTimes(2);

        expect(mockWatch.__getWatchers('file1')[0].isClosed()).toBe(true);
        expect(mockWatch.__getWatchers('file2')[0].isClosed()).toBe(true);
        expect(mockWatch.__getWatchers('file3')[0].isClosed()).toBe(true);
    });
});
