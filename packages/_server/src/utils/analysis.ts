import { genSequence } from 'gensequence';

export const ReasonLineLength =
    'Lines are too long. [More Info…](https://streetsidesoftware.github.io/vscode-spell-checker/docs/configuration/#cspellblockcheckingwhenlinelengthgreaterthan)' as const;
export const ReasonAverageWordsSize =
    'Average Word Size is Too High. [More Info...](https://streetsidesoftware.github.io/vscode-spell-checker/docs/configuration/#cspellblockcheckingwhenaveragechunksizegreatherthan)' as const;
export const ReasonMaxWordsSize =
    'Maximum Word Length is Too High. [More Info…](https://streetsidesoftware.github.io/vscode-spell-checker/docs/configuration/#cspellblockcheckingwhentextchunksizegreaterthan)' as const;

type MinifiedReasons = typeof ReasonLineLength | typeof ReasonAverageWordsSize | typeof ReasonMaxWordsSize;

export interface IsTextLikelyMinifiedOptions {
    /** The maximum line length */
    blockCheckingWhenLineLengthGreaterThan: number;
    /** The maximum size of text chunks */
    blockCheckingWhenTextChunkSizeGreaterThan: number;
    /**
     * The maximum average chunk size.
     * A chunk is the characters between absolute word breaks.
     * Absolute word breaks match: `/[\s,{}[\]]/`
     */
    blockCheckingWhenAverageChunkSizeGreatherThan: number;
}

export const defaultIsTextLikelyMinifiedOptions: IsTextLikelyMinifiedOptions = {
    blockCheckingWhenLineLengthGreaterThan: 10000,
    blockCheckingWhenTextChunkSizeGreaterThan: 500,
    blockCheckingWhenAverageChunkSizeGreatherThan: 80,
};

/**
 * Check if a document is minified making spell checking difficult and slow.
 *
 * @param doc - document to check.
 * @returns true - if the file might be minified.
 */
export function isTextLikelyMinified(text: string, options: IsTextLikelyMinifiedOptions): MinifiedReasons | false {
    const lineBreaks = [0].concat(
        genSequence(text.matchAll(/\n/g))
            .map((a) => a.index || 0)
            .take(100)
            .toArray()
    );
    if (lineBreaks.length < 100) lineBreaks.push(text.length);

    const first100 = genSequence(lineBreaks)
        .scan((a, b) => [a[1], b], [0, 0])
        .map(([a, b]) => text.slice(a, b).trim())
        .filter((a) => !!a)
        .toArray();

    const over1k = genSequence(first100).first((a) => a.length > options.blockCheckingWhenLineLengthGreaterThan);
    if (over1k) return ReasonLineLength;

    const sampleText = first100.join('\n');
    const chunks = [...sampleText.matchAll(/[\s,{}[\]]+/g)].map((a) => a.index || 0);
    chunks.push(sampleText.length);
    const wordCount = chunks.length;
    const avgChunkSize = sampleText.length / wordCount;
    if (avgChunkSize > options.blockCheckingWhenAverageChunkSizeGreatherThan) return ReasonAverageWordsSize;

    const maxChunkSize = chunks.reduce((a, b) => [b, Math.max(a[1], b - a[0])], [0, 0])[1];
    if (maxChunkSize > options.blockCheckingWhenTextChunkSizeGreaterThan) return ReasonMaxWordsSize;

    return false;
}
