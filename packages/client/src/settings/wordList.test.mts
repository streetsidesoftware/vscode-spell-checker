import { describe, expect, test } from 'vitest';

import { createWordList } from './wordList.mjs';

describe('wordList', () => {
    test('createWordList sampleWordListFormatted does not change.', () => {
        const wordList = createWordList(sampleWordListFormatted());
        wordList.sort();
        expect(wordList.toString()).toBe(sampleWordListFormatted());
    });

    test('sort', () => {
        const wordList = createWordList(sampleUnsortedWordListFormatted());
        wordList.sort();
        expect(wordList.toString()).toBe(sampleWordListFormatted());
    });

    test('addWords', () => {
        const wordList = createWordList(sampleWordListFormatted());
        wordList.addWords(['red', 'blue', 'green', 'white']);
        wordList.sort();
        expect(wordList.toString()).toBe(sampleWordListFormatted() + 'white\n');
        expect(wordList.words).toContain('white');
        expect(wordList.entries).toEqual(expect.arrayContaining([{ word: 'white' }, { word: 'cherry', comment: '# a small fruit' }]));
    });

    test('removeWords', () => {
        const wordList = createWordList(sampleWordListFormatted());
        wordList.removeWords(['red', 'blue', 'orange']);
        wordList.sort();
        expect(wordList.toString()).toBe(sampleWordListFormatted().replaceAll(/^(orange|red|blue)\b.*\n/gm, ''));
    });
});

function sampleWordListFormatted() {
    return `\
# This is a list of terms used by our project.
# Please add terms into the appropriate section.
# they will get automatically sorted and deduplicated.

# Fruit
apple
banana
cherry # a small fruit
orange # both a fruit and a color

# Colors
blue
green
orange # both a fruit and a color
red
yellow

# API terms
# none yet

# People
Alice
Bob
Charlie

# New terms not yet placed
`;
}

function sampleUnsortedWordListFormatted() {
    return `\
# This is a list of terms used by our project.
# Please add terms into the appropriate section.
# they will get automatically sorted and deduplicated.

# Fruit
banana
cherry # a small fruit
orange # both a fruit and a color
apple
# Colors
red
yellow
blue
green
orange # both a fruit and a color
# API terms
# none yet

# People
Charlie
Alice
Bob

# New terms not yet placed
`;
}
