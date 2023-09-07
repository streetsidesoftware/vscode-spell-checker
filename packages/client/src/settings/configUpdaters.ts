import type { ConfigUpdater } from './configUpdater';
import { configUpdaterForKey } from './configUpdater';

export function updaterAddWords(words: string[]): ConfigUpdater<'words'> {
    return configUpdaterForKey('words', addWordsFn(words));
}

export function updaterRemoveWords(words: string[]): ConfigUpdater<'words'> {
    return configUpdaterForKey('words', removeWordsFn(words));
}

export function addWordsFn(words: string[] | undefined = []): (lines: string[] | undefined) => string[] {
    return (lines) => sortWords([...new Set((lines || []).concat(words))]);
}

export function removeWordsFn(words: string[]): (lines: string[] | undefined) => string[] {
    return (lines) => {
        const current = new Set(lines || []);
        for (const w of words) {
            current.delete(w);
        }
        return sortWords([...current]);
    };
}

function sortWords(words: string[]): string[] {
    return words.sort(compare);
}

function compare(a: string, b: string): number {
    return a.localeCompare(b);
}
