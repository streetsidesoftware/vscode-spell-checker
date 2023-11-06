/**
 * Text Decoration Settings used to decorate spelling issues when `#cSpell.diagnosticLevel#` is `Hint`.
 */
interface Decoration {
    /**
     * The CSS color used to show issues in the ruler.
     *
     * See:
     * - [`<color>` CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)
     * - [CSS Colors, W3C Schools](https://www.w3schools.com/cssref/css_colors.php)
     * - Hex colors
     * - Use "" (empty string) to disable.
     *
     * Examples:
     * - `green`
     * - `DarkYellow`
     * - `#ffff0080` - semi-transparent yellow.
     * - `rgb(255 153 0 / 80%)`
     *
     * @scope application
     * @default "#fc4c"
     * @version 4.0.0
     */
    overviewRulerColor?: string;

    /**
     * The CSS Style used to decorate spelling issues. Depends upon `#cSpell.decorateIssues#`.
     *
     * This setting is used to manually configure the text decoration. If it is not set, the following settings are used:
     * - `#cSpell.textDecorationLine#` to pick the line type
     * - `#cSpell.textDecorationStyle#` to pick the style
     * - `#cSpell.textDecorationColor#` to set the color
     * - `#cSpell.textDecorationThickness#` to set the thickness.
     *
     * See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
     *
     * Format:  `<line> [style] <color> [thickness]`
     *
     * - line - `underline`, `overline`, see: [text-decoration-line, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line)
     * - style - `solid`, `wavy`, `dotted`, see: [text-decoration-style, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style)
     * - color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)
     * - thickness - see: [text-decoration-thickness, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-thickness)
     *
     * Examples:
     * - `underline green`
     * - `underline dotted yellow 0.2rem`
     * - `underline wavy #ff0c 1.5px` - Wavy underline with 1.5px thickness in semi-transparent yellow.
     *
     * @scope application
     * @version 4.0.0
     */
    textDecoration?: string;

    /**
     * The CSS line type used to decorate issues.
     *
     * See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
     * - line - `underline`, `overline`, see: [text-decoration-line, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line)
     *
     * @scope application
     * @default "underline"
     * @version 4.0.0
     */
    textDecorationLine?: 'underline' | 'overline' | 'line-through';

    /**
     * The CSS line style used to decorate issues.
     *
     * See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
     * - style - `solid`, `wavy`, `dotted`, see: [text-decoration-style, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style)
     *
     * @scope application
     * @default "wavy"
     * @version 4.0.0
     */
    textDecorationStyle?: 'solid' | 'wavy' | 'dotted' | 'dashed' | 'double';

    /**
     * The CSS line thickness used to decorate issues.
     *
     * See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
     * - thickness - see: [text-decoration-thickness, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-thickness)
     *
     * Examples:
     * - `auto`
     * - `from-font`
     * - `0.2rem`
     * - `1.5px`
     * - `10%`
     *
     * @scope application
     * @default "auto"
     * @version 4.0.0
     */
    textDecorationThickness?: 'auto' | 'from-font' | string;

    /**
     * The decoration color for normal spelling issues.
     *
     * See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
     * - color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)
     *
     * Examples:
     * - `green`
     * - `yellow`
     * - `#ff0c`
     *
     * @scope application
     * @default "#fc4"
     * @version 4.0.0
     */
    textDecorationColor?: string;

    /**
     * The decoration color for flagged issues.
     *
     * See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
     * - color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)
     *
     * Examples:
     * - `green`
     * - `yellow`
     * - `#ff0c`
     *
     * @scope application
     * @default "#f44"
     * @version 4.0.0
     */
    textDecorationColorFlagged?: string;

    /**
     * The decoration color for spelling suggestions.
     *
     * See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
     * - color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)
     *
     * Examples:
     * - `green`
     * - `yellow`
     * - `#ff0c`
     *
     * @scope application
     * @default "#888"
     * @version 4.0.0
     * @hidden hide this for now. It won't be used until we have a way to get pure suggestions.
     */
    textDecorationColorSuggestion?: string;
}

/**
 * Text Decoration Settings used to decorate spelling issues when `#cSpell.diagnosticLevel#` is `Hint`.
 */
interface Appearance extends Decoration {
    /**
     * Decoration for light themes.
     *
     * See:
     * - `#cSpell.overviewRulerColor#`
     * - `#cSpell.textDecoration#`
     * @scope application
     */
    light?: Decoration;

    /**
     * Decoration for dark themes.
     *
     * See:
     * - `#cSpell.overviewRulerColor#`
     * - `#cSpell.textDecoration#`
     * @scope application
     */
    dark?: Decoration;
}

export interface AppearanceSettings extends Appearance {
    /**
     * Draw custom decorations on Spelling Issues when the `#cSpell.diagnosticLevel#` is `Hint`.
     *
     * @scope application
     * @version 4.0.0
     * @default false
     */
    decorateIssues?: boolean;
}
