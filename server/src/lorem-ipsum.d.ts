declare module 'lorem-ipsum' {

    interface Options {
        count: number;                  // default (1): Number of words, sentences, or paragraphs to generate.
        units: string;                  // default "sentences": Generate words, sentences, or paragraphs.
        sentenceLowerBound: number;     // default (5): Minimum words per sentence.
        sentenceUpperBound: number;     // default (15): Maximum words per sentence.
        paragraphLowerBound: number;    // default (3): Minimum sentences per paragraph.
        paragraphUpperBound: number;    // default (7): Maximum sentences per paragraph.
        format: string;                 // default "plain": Plain text or html
        words: string[];                // Custom word dictionary. Uses dictionary.words (in lib/dictionary.js) by default.
        random: number;                 // A PRNG function. Uses Math.random by default
        suffix: string;                 // The character to insert between paragraphs. Defaults to default EOL for your OS.
    }

    function loremIpsum(options?: Options): string;

    export = loremIpsum;

}

