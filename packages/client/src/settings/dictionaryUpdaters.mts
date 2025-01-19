import type { ConfigUpdater } from './configUpdater.mjs';
import { configUpdaterForKey } from './configUpdater.mjs';
import { createWordListFromLines } from './wordList.mjs';

export function updaterAddWords(words: string[]): ConfigUpdater<'words'> {
    return configUpdaterForKey('words', addWordsFn(words));
}

export function updaterRemoveWords(words: string[]): ConfigUpdater<'words'> {
    return configUpdaterForKey('words', removeWordsFn(words));
}

export function addWordsFn(words: string[] | undefined = []): (lines: string[] | undefined) => string[] {
    return (lines) => {
        const wordList = createWordListFromLines(lines || []);
        wordList.addWords(words);
        wordList.sort();
        return wordList.toString().split('\n').slice(0, -1);
    };
}

export function removeWordsFn(words: string[]): (lines: string[] | undefined) => string[] {
    return (lines) => {
        const wordList = createWordListFromLines(lines || []);
        wordList.removeWords(words);
        wordList.sort();
        return wordList.toString().split('\n').slice(0, -1);
    };
}
