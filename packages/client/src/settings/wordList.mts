export const commentPrefix = '#';

export interface WordListEntry {
    word?: string | undefined;
    comment?: string | undefined;
}

export interface WordListWordEntry extends WordListEntry {
    word: string;
}

export interface WordListHeaderEntry extends WordListEntry {
    /** the word is empty, either '' or undefined */
    word?: string | undefined;
    comment: string;
}

export interface WordList {
    addWords(words: (string | WordListEntry)[]): void;
    removeWords(words: string[]): void;
    readonly words: string[];
    readonly entries: WordListEntry[];
    /**
     * Sort the words in the list and removes duplicates.
     * Sections are separated by headers.
     */
    sort(): void;
    toString(): string;
}

export function createWordList(content: string): WordList {
    const lines = content.split('\n');
    return createWordListFromLines(lines);
}

export function createWordListFromLines(lines: string[]): WordList {
    return new WordListImpl(lines);
}

class WordListImpl implements WordList {
    private _entries: WordListEntry[] = [];

    constructor(lines: string[]) {
        this._entries = lines.map(lineToEntry);
    }

    get words(): string[] {
        return this._entries.filter(isWordListWord).map((e) => e.word);
    }

    get entries(): (WordListEntry | WordListHeaderEntry)[] {
        return this._entries;
    }

    addWords(words: (string | WordListEntry | WordListHeaderEntry)[]): void {
        const entries = words.map((w) => (typeof w === 'string' ? lineToEntry(w) : w));
        this._entries.push(...entries);
    }

    removeWords(words: string[]): void {
        const toRemove = new Set(words);
        this._entries = this._entries.filter((w) => !w.word || !toRemove.has(w.word));
    }

    sort(): void {
        const knownWords = new Set<string>();

        const sections = wordListEntriesToSections(this._entries);

        for (const section of sections) {
            section.words.sort((a, b) => a.word.localeCompare(b.word));
            section.words = section.words.filter((w) => {
                if (knownWords.has(w.word) && !w.comment) return false;
                knownWords.add(w.word);
                return true;
            });
        }

        this._entries = sectionsToEntries(sections);
    }

    toString(): string {
        const sections = wordListEntriesToSections(this._entries);
        const s = sections.map((s) => sectionToString(s)).join('');
        return s.endsWith('\n\n') ? s.slice(0, -1) : s;
    }
}

function lineToEntry(line: string): WordListWordEntry | WordListHeaderEntry {
    const parts = line.split('#', 2);
    if (parts.length === 1) {
        return { word: parts[0].trim() };
    }
    if (!parts[0]) {
        return { comment: commentPrefix + parts[1].trimEnd() };
    }
    return { word: parts[0].trim() || ' ', comment: commentPrefix + parts[1].trimEnd() };
}

interface WordListSection {
    header: WordListHeaderEntry | undefined;
    words: WordListWordEntry[];
    hasEmptyLines: boolean;
}

function wordListEntriesToSections(entries: WordListEntry[]): WordListSection[] {
    const sections: WordListSection[] = [];
    let currentSection: WordListSection = { header: undefined, words: [], hasEmptyLines: false };
    for (const entry of entries) {
        if (isWordListHeader(entry)) {
            if (currentSection.header) {
                sections.push(currentSection);
            }
            currentSection = { header: entry, words: [], hasEmptyLines: false };
            continue;
        }
        if (!isWordListWord(entry)) {
            currentSection.hasEmptyLines = true;
            continue; // skip empty lines.
        }
        currentSection.words.push(entry);
    }
    sections.push(currentSection);
    return sections;
}

function sectionsToEntries(sections: WordListSection[]): WordListEntry[] {
    return sections.flatMap((s) => (s.header ? [s.header, ...s.words, ...(s.hasEmptyLines ? [{ word: '' }] : [])] : s.words));
}

function isWordListHeader(entry: WordListEntry): entry is WordListHeaderEntry {
    return !!entry.comment && !entry.word;
}

function isWordListWord(entry: WordListEntry): entry is WordListWordEntry {
    return !!entry.word;
}

function sectionToString(section: WordListSection): string {
    const header = wordListHeaderToString(section.header);
    const words = section.words.map((w) => wordEntryToString(w)).join('');
    const sep = section.hasEmptyLines || section.words.length ? '\n' : '';
    return header + words + sep;
}

function wordListHeaderToString(header: WordListHeaderEntry | undefined): string {
    if (header?.comment) {
        return header.comment + '\n';
    }
    return '';
}

function wordEntryToString(entry: WordListWordEntry): string {
    return entry.word + (entry.comment ? ' ' + entry.comment : '') + '\n';
}
