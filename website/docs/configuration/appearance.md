---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mjs`
title: Appearance
id: appearance
---

# Appearance


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.dark`](#cspelldark) | application | Decoration for dark themes. |
| [`cSpell.doNotUseCustomDecorationForScheme`](#cspelldonotusecustomdecorationforscheme) | application | Use VS Code to Render Spelling Issues |
| [`cSpell.light`](#cspelllight) | application | Decoration for light themes. |
| [`cSpell.overviewRulerColor`](#cspelloverviewrulercolor) | application | The CSS color used to show issues in the ruler. |
| [`cSpell.textDecoration`](#cspelltextdecoration) | application | The CSS Style used to decorate spelling issues. Depends upon `#cSpell.useCustomDecorations#`. |
| [`cSpell.textDecorationColor`](#cspelltextdecorationcolor) | application | The decoration color for normal spelling issues. |
| [`cSpell.textDecorationColorFlagged`](#cspelltextdecorationcolorflagged) | application | The decoration color for flagged issues. |
| [`cSpell.textDecorationColorSuggestion`](#cspelltextdecorationcolorsuggestion) | application | The decoration color for spelling suggestions. |
| [`cSpell.textDecorationLine`](#cspelltextdecorationline) | application | The CSS line type used to decorate issues. |
| [`cSpell.textDecorationStyle`](#cspelltextdecorationstyle) | application | The CSS line style used to decorate issues. |
| [`cSpell.textDecorationThickness`](#cspelltextdecorationthickness) | application | The CSS line thickness used to decorate issues. |
| [`cSpell.useCustomDecorations`](#cspellusecustomdecorations) | application | Draw custom decorations on Spelling Issues. |


## Definitions


### `cSpell.dark`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.dark`

</dd>


<dt>
Type
</dt>
<dd>

`object`

</dd>


<dt>
Scope
</dt>
<dd>

application

</dd>


<dt>
Description
</dt>
<dd>

Decoration for dark themes.

See:
- [`cSpell.overviewRulerColor`](#cspelloverviewrulercolor)
- [`cSpell.textDecoration`](#cspelltextdecoration)

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


### `cSpell.doNotUseCustomDecorationForScheme`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.doNotUseCustomDecorationForScheme` -- Use VS Code to Render Spelling Issues

</dd>


<dt>
Type
</dt>
<dd>

`object`

</dd>


<dt>
Scope
</dt>
<dd>

application

</dd>


<dt>
Description
</dt>
<dd>

Use the VS Code Diagnostic Collection to render spelling issues.

With some edit boxes, like the source control message box, the custom decorations do not show up.
This setting allows the use of the VS Code Diagnostic Collection to render spelling issues.

</dd>




<dt>
Default
</dt>
<dd>

_`{"vscode-scm":true}`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


### `cSpell.light`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.light`

</dd>


<dt>
Type
</dt>
<dd>

`object`

</dd>


<dt>
Scope
</dt>
<dd>

application

</dd>


<dt>
Description
</dt>
<dd>

Decoration for light themes.

See:
- [`cSpell.overviewRulerColor`](#cspelloverviewrulercolor)
- [`cSpell.textDecoration`](#cspelltextdecoration)

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


### `cSpell.overviewRulerColor`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.overviewRulerColor`

</dd>


<dt>
Type
</dt>
<dd>

`string`

</dd>


<dt>
Scope
</dt>
<dd>

application

</dd>


<dt>
Description
</dt>
<dd>

The CSS color used to show issues in the ruler.

See:
- [`<color>` CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)
- [CSS Colors, W3C Schools](https://www.w3schools.com/cssref/css_colors.php)
- Hex colors
- Use "" (empty string) to disable.

Examples:
- `green`
- `DarkYellow`
- `#ffff0080` - semi-transparent yellow.
- `rgb(255 153 0 / 80%)`

</dd>




<dt>
Default
</dt>
<dd>

_`"#fc4c"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


### `cSpell.textDecoration`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecoration`

</dd>


<dt>
Type
</dt>
<dd>

`string`

</dd>


<dt>
Scope
</dt>
<dd>

application

</dd>


<dt>
Description
</dt>
<dd>

The CSS Style used to decorate spelling issues. Depends upon [`cSpell.useCustomDecorations`](#cspellusecustomdecorations).

This setting is used to manually configure the text decoration. If it is not set, the following settings are used:
- [`cSpell.textDecorationLine`](#cspelltextdecorationline) to pick the line type
- [`cSpell.textDecorationStyle`](#cspelltextdecorationstyle) to pick the style
- [`cSpell.textDecorationColor`](#cspelltextdecorationcolor) to set the color
- [`cSpell.textDecorationThickness`](#cspelltextdecorationthickness) to set the thickness.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)

Format:  `<line> [style] <color> [thickness]`

- line - `underline`, `overline`, see: [text-decoration-line, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line)
- style - `solid`, `wavy`, `dotted`, see: [text-decoration-style, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style)
- color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)
- thickness - see: [text-decoration-thickness, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-thickness)

Examples:
- `underline green`
- `underline dotted yellow 0.2rem`
- `underline wavy #ff0c 1.5px` - Wavy underline with 1.5px thickness in semi-transparent yellow.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


### `cSpell.textDecorationColor`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecorationColor`

</dd>


<dt>
Type
</dt>
<dd>

`string`

</dd>


<dt>
Scope
</dt>
<dd>

application

</dd>


<dt>
Description
</dt>
<dd>

The decoration color for normal spelling issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)

Examples:
- `green`
- `yellow`
- `#ff0c`

</dd>




<dt>
Default
</dt>
<dd>

_`"#fc4"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


### `cSpell.textDecorationColorFlagged`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecorationColorFlagged`

</dd>


<dt>
Type
</dt>
<dd>

`string`

</dd>


<dt>
Scope
</dt>
<dd>

application

</dd>


<dt>
Description
</dt>
<dd>

The decoration color for flagged issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)

Examples:
- `green`
- `yellow`
- `#ff0c`

</dd>




<dt>
Default
</dt>
<dd>

_`"#f44"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


### `cSpell.textDecorationColorSuggestion`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecorationColorSuggestion`

</dd>


<dt>
Type
</dt>
<dd>

`string`

</dd>


<dt>
Scope
</dt>
<dd>

application

</dd>


<dt>
Description
</dt>
<dd>

The decoration color for spelling suggestions.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)

Common Format: `#RGBA` or `#RRGGBBAA` or `#RGB` or `#RRGGBB`

Examples:
- `green`
- `yellow`
- `#ff0c`

</dd>




<dt>
Default
</dt>
<dd>

_`"#8884"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.2

</dd>


</dl>

---


### `cSpell.textDecorationLine`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecorationLine`

</dd>


<dt>
Type
</dt>
<dd>

`( "underline" | "overline" | "line-through" )`

</dd>


<dt>
Scope
</dt>
<dd>

application

</dd>


<dt>
Description
</dt>
<dd>

The CSS line type used to decorate issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- line - `underline`, `overline`, see: [text-decoration-line, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line)

</dd>




<dt>
Default
</dt>
<dd>

_`"underline"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


### `cSpell.textDecorationStyle`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecorationStyle`

</dd>


<dt>
Type
</dt>
<dd>

`( "solid" | "wavy" | "dotted" | "dashed" | "double" )`

</dd>


<dt>
Scope
</dt>
<dd>

application

</dd>


<dt>
Description
</dt>
<dd>

The CSS line style used to decorate issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- style - `solid`, `wavy`, `dotted`, see: [text-decoration-style, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style)

</dd>




<dt>
Default
</dt>
<dd>

_`"wavy"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


### `cSpell.textDecorationThickness`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecorationThickness`

</dd>


<dt>
Type
</dt>
<dd>

`string`

</dd>


<dt>
Scope
</dt>
<dd>

application

</dd>


<dt>
Description
</dt>
<dd>

The CSS line thickness used to decorate issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- thickness - see: [text-decoration-thickness, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-thickness)

Examples:
- `auto`
- `from-font`
- `0.2rem`
- `1.5px`
- `10%`

</dd>




<dt>
Default
</dt>
<dd>

_`"auto"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


### `cSpell.useCustomDecorations`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.useCustomDecorations`

</dd>


<dt>
Type
</dt>
<dd>

`boolean`

</dd>


<dt>
Scope
</dt>
<dd>

application

</dd>


<dt>
Description
</dt>
<dd>

Draw custom decorations on Spelling Issues.
- `true` - Use custom decorations.
- `false` - Use the VS Code Diagnostic Collection to render spelling issues.

</dd>




<dt>
Default
</dt>
<dd>

_`true`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---

