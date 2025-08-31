/**
 * Text Decoration Settings used to decorate spelling issues.
 */
interface Decoration {
    /**
     * The CSS color used to show issues in the ruler.
     *
     * Depends upon `#cSpell.useCustomDecorations#`.
     * Disable the ruler by setting `#cSpell.showInRuler#` to `false`.
     *
     * See:
     * - [`<color>` CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)
     * - [CSS Colors, W3C Schools](https://www.w3schools.com/cssref/css_colors.php)
     * - Hex colors
     *
     * Examples:
     * - `green`
     * - `DarkYellow`
     * - `#ffff0080` - semi-transparent yellow.
     * - `rgb(255 153 0 / 80%)`
     *
     * @scope application
     * @since 4.0.0
     * @default "#348feb80"
     */
    overviewRulerColor?: string;

    /**
     * The CSS Style used to decorate spelling issues. Depends upon `#cSpell.useCustomDecorations#`.
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
     * To change the ruler color, use `#cSpell.overviewRulerColor#`.
     *
     * @scope application
     * @since 4.0.0
     */
    textDecoration?: string;

    /**
     * The CSS line type used to decorate issues.
     *
     * See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
     * - line - `underline`, `overline`, see: [text-decoration-line, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line)
     *
     * @scope application
     * @since 4.0.0
     * @default "underline"
     */
    textDecorationLine?: 'underline' | 'overline' | 'line-through';

    /**
     * The CSS line style used to decorate issues.
     *
     * See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
     * - style - `solid`, `wavy`, `dotted`, see: [text-decoration-style, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style)
     *
     * @scope application
     * @since 4.0.0
     * @default "dashed"
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
     * @since 4.0.0
     * @default "auto"
     */
    textDecorationThickness?: 'auto' | 'from-font' | string;

    /**
     * The decoration color for normal spelling issues.
     *
     * See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
     * - color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)
     *
     * To change the ruler color, use `#cSpell.overviewRulerColor#`.
     *
     * Examples:
     * - `green`
     * - `yellow`
     * - `#ff0c`
     *
     * @scope application
     * @since 4.0.0
     * @default "#348feb"
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
     * @since 4.0.0
     * @default "#f44"
     */
    textDecorationColorFlagged?: string;

    /**
     * The decoration color for spelling suggestions.
     *
     * See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
     * - color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)
     *
     * Common Format: `#RGBA` or `#RRGGBBAA` or `#RGB` or `#RRGGBB`
     *
     * Examples:
     * - `green`
     * - `yellow`
     * - `#ff0c`
     *
     * @scope application
     * @since 4.0.2
     * @default "#cf88"
     */
    textDecorationColorSuggestion?: string;
}

/**
 * Text Decoration Settings used to decorate spelling issues.
 */
interface Appearance extends Decoration {
    /**
     * Decoration for light themes.
     *
     * See:
     * - `#cSpell.overviewRulerColor#`
     * - `#cSpell.textDecoration#`
     * @scope application
     * @since 4.0.0
     */
    light?: Decoration;

    /**
     * Decoration for dark themes.
     *
     * See:
     * - `#cSpell.overviewRulerColor#`
     * - `#cSpell.textDecoration#`
     * @scope application
     * @since 4.0.0
     */
    dark?: Decoration;
}

export interface AppearanceSettings extends Appearance {
    /**
     * Show spelling issues in the editor ruler.
     *
     * Note: This setting is only used when `#cSpell.useCustomDecorations#` is `true`.
     *
     * Note: To set the color of the ruler, use `#cSpell.overviewRulerColor#`.
     *
     * @scope application
     * @since 4.0.35
     * @default true
     */
    showInRuler?: boolean;

    /**
     * Draw custom decorations on Spelling Issues.
     * - `true` - Use custom decorations. - VS Code Diagnostic Severity Levels are not used.
     * - `false` - Use the VS Code Diagnostic Collection to render spelling issues.
     *
     * Note: This setting overrides the VS Code Diagnostics setting: `#cSpell.diagnosticLevel#`.
     *
     * @scope application
     * @since 4.0.0
     * @default false
     */
    useCustomDecorations?: boolean;

    /**
     * Use the VS Code Diagnostic Collection to render spelling issues.
     *
     * With some edit boxes, like the source control message box, the custom decorations do not show up.
     * This setting allows the use of the VS Code Diagnostic Collection to render spelling issues.
     *
     * @title Use VS Code to Render Spelling Issues
     * @scope application
     * @since 4.0.0
     * @default { "vscode-scm": true }
     */
    doNotUseCustomDecorationForScheme?: Record<string, boolean>;
}
