export interface SpellCheckerShouldCheckDocSettings {
    /**
     * The maximum line length.
     *
     *
     * Block spell checking if lines are longer than the value given.
     * This is used to prevent spell checking generated files.
     *
     *
     * **Error Message:** _Lines are too long._
     *
     *
     * @scope language-overridable
     * @default 10000
     */
    blockCheckingWhenLineLengthGreaterThan?: number;

    /**
     * The maximum length of a chunk of text without word breaks.
     *
     *
     * It is used to prevent spell checking of generated files.
     *
     *
     * A chunk is the characters between absolute word breaks.
     * Absolute word breaks match: `/[\s,{}[\]]/`, i.e. spaces or braces.
     *
     *
     * **Error Message:** _Maximum Word Length is Too High._
     *
     *
     * If you are seeing this message, it means that the file contains a very long line
     * without many word breaks.
     *
     * @scope language-overridable
     * @default 500
     */
    blockCheckingWhenTextChunkSizeGreaterThan?: number;

    /**
     * The maximum average length of chunks of text without word breaks.
     *
     *
     * A chunk is the characters between absolute word breaks.
     * Absolute word breaks match: `/[\s,{}[\]]/`
     *
     *
     * **Error Message:** _Average Word Size is Too High._
     *
     *
     * If you are seeing this message, it means that the file contains mostly long lines
     * without many word breaks.
     *
     * @scope language-overridable
     * @default 80
     */
    blockCheckingWhenAverageChunkSizeGreaterThan?: number;
}
