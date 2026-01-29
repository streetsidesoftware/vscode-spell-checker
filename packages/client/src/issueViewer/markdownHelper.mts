/**
 * Make sure a work can be displayed in markdown.
 * @param word - word to clean
 * @returns string
 */
export function cleanWord(word: string): string {
    const inlineWord = markdownInlineCode(word);
    return inlineWord.replace(/^`+/g, '').replace(/`+$/g, '');
}
/**
 * Create valid markdown for inline code.
 * @param text - text to inline as code
 * @returns string
 */
export function markdownInlineCode(text: string): string {
    const countTicks = [...text.matchAll(/`+/g)].map((m) => m[0].length).reduce((a, b) => Math.max(a, b), 0);
    const ticks = '`'.repeat(countTicks + 1);
    text = text.replace(/\t/g, '⇥').replace(/\r?\n/g, '⏎').replace(/\r/g, '⏎').replace(/\s/g, ' ').replace('`$', '` ').replace('^`', ' `');
    return ticks + text + ticks;
}
