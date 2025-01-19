import type { ConfigUpdater } from './configUpdater.mjs';
import { configUpdaterForKey } from './configUpdater.mjs';
import { compareWords } from './wordList.mjs';

export function updaterAddWords(words: string[]): ConfigUpdater<'words'> {
    return configUpdaterForKey('words', addWordsFn(words));
}

export function updaterRemoveWords(words: string[]): ConfigUpdater<'words'> {
    return configUpdaterForKey('words', removeWordsFn(words));
}

/**
 * Returns a function that adds words to a list of words. The function sorts the list of words in place.
 * The existing words are changed in place to allow for comments and other content to be preserved.
 * @param wordsToAdd - The words to add.
 * @returns A function that adds the words to a list of words.
 */
export function addWordsFn(wordsToAdd: string[] | undefined = []): (existingWords: string[] | undefined) => string[] {
    return (existingWords) => {
        const known = new Set(existingWords);
        const newWords = wordsToAdd.filter((w) => !known.has(w));
        existingWords ??= [];
        existingWords.push(...newWords);
        existingWords.sort(compareWords);
        return existingWords;
    };
}

/**
 * Returns a function that removes words from a list of words. The function removes the words in place to allow for
 * comments and other content to be preserved. The existing words will be sorted in place.
 * @param wordsToRemove - The words to remove.
 * @returns A function that removes the words from a list of words.
 */
export function removeWordsFn(wordsToRemove: string[]): (existingWords: string[] | undefined) => string[] {
    const toRemove = new Set(wordsToRemove);
    return (existingWords) => {
        if (!existingWords?.length) return [];
        for (let i = existingWords.length - 1; i >= 0; i--) {
            if (toRemove.has(existingWords[i])) {
                existingWords.splice(i, 1);
            }
        }
        existingWords.sort(compareWords);
        return existingWords;
    };
}
