---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mts`
title: Appearance
id: appearance
---

# Appearance

Settings that control the appearance of the spell checker.


<table>
<thead>
<tr>
<th>

Setting

</th>
<th>

Scope

</th>
<th>

Description

</th>
</tr>
</thead>
<tbody>
<tr>
<td>

[`cSpell.dark`](#cspelldark)

</td>
<td>

application

</td>
<td>

Decoration for dark themes.

</td>
</tr>
<tr>
<td>

[`cSpell.doNotUseCustomDecorationForScheme`](#cspelldonotusecustomdecorationforscheme)

</td>
<td>

application

</td>
<td>

Use VS Code to Render Spelling Issues

</td>
</tr>
<tr>
<td>

[`cSpell.light`](#cspelllight)

</td>
<td>

application

</td>
<td>

Decoration for light themes.

</td>
</tr>
<tr>
<td>

[`cSpell.overviewRulerColor`](#cspelloverviewrulercolor)

</td>
<td>

application

</td>
<td>

The CSS color used to show issues in the ruler.

</td>
</tr>
<tr>
<td>

[`cSpell.showInRuler`](#cspellshowinruler)

</td>
<td>

application

</td>
<td>

Show spelling issues in the editor ruler.

</td>
</tr>
<tr>
<td>

[`cSpell.textDecoration`](#cspelltextdecoration)

</td>
<td>

application

</td>
<td>

The CSS Style used to decorate spelling issues. Depends upon [`cSpell.useCustomDecorations`](appearance#cspellusecustomdecorations).

</td>
</tr>
<tr>
<td>

[`cSpell.textDecorationColor`](#cspelltextdecorationcolor)

</td>
<td>

application

</td>
<td>

The decoration color for normal spelling issues.

</td>
</tr>
<tr>
<td>

[`cSpell.textDecorationColorFlagged`](#cspelltextdecorationcolorflagged)

</td>
<td>

application

</td>
<td>

The decoration color for flagged issues.

</td>
</tr>
<tr>
<td>

[`cSpell.textDecorationColorSuggestion`](#cspelltextdecorationcolorsuggestion)

</td>
<td>

application

</td>
<td>

The decoration color for spelling suggestions.

</td>
</tr>
<tr>
<td>

[`cSpell.textDecorationLine`](#cspelltextdecorationline)

</td>
<td>

application

</td>
<td>

The CSS line type used to decorate issues.

</td>
</tr>
<tr>
<td>

[`cSpell.textDecorationStyle`](#cspelltextdecorationstyle)

</td>
<td>

application

</td>
<td>

The CSS line style used to decorate issues.

</td>
</tr>
<tr>
<td>

[`cSpell.textDecorationThickness`](#cspelltextdecorationthickness)

</td>
<td>

application

</td>
<td>

The CSS line thickness used to decorate issues.

</td>
</tr>
<tr>
<td>

[`cSpell.useCustomDecorations`](#cspellusecustomdecorations)

</td>
<td>

application

</td>
<td>

Draw custom decorations on Spelling Issues.

</td>
</tr>
</tbody>
</table>


## Settings


### `cSpell.dark`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.dark`

</dd>

<dt>
Description
</dt>
<dd>

Decoration for dark themes.

See:
- [`cSpell.overviewRulerColor`](appearance#cspelloverviewrulercolor)
- [`cSpell.textDecoration`](appearance#cspelltextdecoration)

</dd>

<dt>
Type
</dt>
<dd>

<table>
<thead>
<tr>
<th>

Fields

</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

overviewRulerColor

</dd>

<dt>
Description
</dt>
<dd>

The CSS color used to show issues in the ruler.

Depends upon [`cSpell.useCustomDecorations`](appearance#cspellusecustomdecorations).
Disable the ruler by setting [`cSpell.showInRuler`](appearance#cspellshowinruler) to `false`.

See:
- [`<color>` CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)
- [CSS Colors, W3C Schools](https://www.w3schools.com/cssref/css_colors.php)
- Hex colors

Examples:
- `green`
- `DarkYellow`
- `#ffff0080` - semi-transparent yellow.
- `rgb(255 153 0 / 80%)`

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
Default
</dt>
<dd>

_`"#348feb80"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecoration

</dd>

<dt>
Description
</dt>
<dd>

The CSS Style used to decorate spelling issues. Depends upon [`cSpell.useCustomDecorations`](appearance#cspellusecustomdecorations).

This setting is used to manually configure the text decoration. If it is not set, the following settings are used:
- [`cSpell.textDecorationLine`](appearance#cspelltextdecorationline) to pick the line type
- [`cSpell.textDecorationStyle`](appearance#cspelltextdecorationstyle) to pick the style
- [`cSpell.textDecorationColor`](appearance#cspelltextdecorationcolor) to set the color
- [`cSpell.textDecorationThickness`](appearance#cspelltextdecorationthickness) to set the thickness.

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

To change the ruler color, use [`cSpell.overviewRulerColor`](appearance#cspelloverviewrulercolor).

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecorationColor

</dd>

<dt>
Description
</dt>
<dd>

The decoration color for normal spelling issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)

To change the ruler color, use [`cSpell.overviewRulerColor`](appearance#cspelloverviewrulercolor).

Examples:
- `green`
- `yellow`
- `#ff0c`

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
Default
</dt>
<dd>

_`"#348feb"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecorationColorFlagged

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
Type
</dt>
<dd>

`string`

</dd>

<dt>
Default
</dt>
<dd>

_`"#f44"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecorationColorSuggestion

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
Type
</dt>
<dd>

`string`

</dd>

<dt>
Default
</dt>
<dd>

_`"#cf88"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.2

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecorationLine

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
Type
</dt>
<dd>

`( "underline" | "overline" | "line-through" )`

</dd>

<dt>
Default
</dt>
<dd>

_`"underline"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecorationStyle

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
Type
</dt>
<dd>

`( "solid" | "wavy" | "dotted" | "dashed" | "double" )`

</dd>

<dt>
Default
</dt>
<dd>

_`"dashed"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecorationThickness

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
Type
</dt>
<dd>

`string`

</dd>

<dt>
Default
</dt>
<dd>

_`"auto"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
</tbody>
</table>

<details>
<summary>

TypeScript:

</summary>

```ts
{
  overviewRulerColor?: string;
  textDecoration?: string;
  textDecorationColor?: string;
  textDecorationColorFlagged?: string;
  textDecorationColorSuggestion?: string;
  textDecorationLine?: ("underline" | "overline" | "line-through");
  textDecorationStyle?: ("solid" | "wavy" | "dotted" | "dashed" | "double");
  textDecorationThickness?: string;
}
```

</details>

</dd>

<dt>
Scope
</dt>
<dd>

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

<dt>
Since Extension Version
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
Description
</dt>
<dd>

Use the VS Code Diagnostic Collection to render spelling issues.

With some edit boxes, like the source control message box, the custom decorations do not show up.
This setting allows the use of the VS Code Diagnostic Collection to render spelling issues.

</dd>

<dt>
Type
</dt>
<dd>

```ts
{
  [key: string]: boolean;
}
```

</dd>

<dt>
Scope
</dt>
<dd>

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

```json5 title="default"
{
  "chatSessionInput": true,
  "comment": true,
  "vscode-scm": true
}
```

</dd>

<dt>
Since Extension Version
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
Description
</dt>
<dd>

Decoration for light themes.

See:
- [`cSpell.overviewRulerColor`](appearance#cspelloverviewrulercolor)
- [`cSpell.textDecoration`](appearance#cspelltextdecoration)

</dd>

<dt>
Type
</dt>
<dd>

<table>
<thead>
<tr>
<th>

Fields

</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

overviewRulerColor

</dd>

<dt>
Description
</dt>
<dd>

The CSS color used to show issues in the ruler.

Depends upon [`cSpell.useCustomDecorations`](appearance#cspellusecustomdecorations).
Disable the ruler by setting [`cSpell.showInRuler`](appearance#cspellshowinruler) to `false`.

See:
- [`<color>` CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)
- [CSS Colors, W3C Schools](https://www.w3schools.com/cssref/css_colors.php)
- Hex colors

Examples:
- `green`
- `DarkYellow`
- `#ffff0080` - semi-transparent yellow.
- `rgb(255 153 0 / 80%)`

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
Default
</dt>
<dd>

_`"#348feb80"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecoration

</dd>

<dt>
Description
</dt>
<dd>

The CSS Style used to decorate spelling issues. Depends upon [`cSpell.useCustomDecorations`](appearance#cspellusecustomdecorations).

This setting is used to manually configure the text decoration. If it is not set, the following settings are used:
- [`cSpell.textDecorationLine`](appearance#cspelltextdecorationline) to pick the line type
- [`cSpell.textDecorationStyle`](appearance#cspelltextdecorationstyle) to pick the style
- [`cSpell.textDecorationColor`](appearance#cspelltextdecorationcolor) to set the color
- [`cSpell.textDecorationThickness`](appearance#cspelltextdecorationthickness) to set the thickness.

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

To change the ruler color, use [`cSpell.overviewRulerColor`](appearance#cspelloverviewrulercolor).

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecorationColor

</dd>

<dt>
Description
</dt>
<dd>

The decoration color for normal spelling issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)

To change the ruler color, use [`cSpell.overviewRulerColor`](appearance#cspelloverviewrulercolor).

Examples:
- `green`
- `yellow`
- `#ff0c`

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
Default
</dt>
<dd>

_`"#348feb"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecorationColorFlagged

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
Type
</dt>
<dd>

`string`

</dd>

<dt>
Default
</dt>
<dd>

_`"#f44"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecorationColorSuggestion

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
Type
</dt>
<dd>

`string`

</dd>

<dt>
Default
</dt>
<dd>

_`"#cf88"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.2

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecorationLine

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
Type
</dt>
<dd>

`( "underline" | "overline" | "line-through" )`

</dd>

<dt>
Default
</dt>
<dd>

_`"underline"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecorationStyle

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
Type
</dt>
<dd>

`( "solid" | "wavy" | "dotted" | "dashed" | "double" )`

</dd>

<dt>
Default
</dt>
<dd>

_`"dashed"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

textDecorationThickness

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
Type
</dt>
<dd>

`string`

</dd>

<dt>
Default
</dt>
<dd>

_`"auto"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

</td>
</tr>
</tbody>
</table>

<details>
<summary>

TypeScript:

</summary>

```ts
{
  overviewRulerColor?: string;
  textDecoration?: string;
  textDecorationColor?: string;
  textDecorationColorFlagged?: string;
  textDecorationColorSuggestion?: string;
  textDecorationLine?: ("underline" | "overline" | "line-through");
  textDecorationStyle?: ("solid" | "wavy" | "dotted" | "dashed" | "double");
  textDecorationThickness?: string;
}
```

</details>

</dd>

<dt>
Scope
</dt>
<dd>

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

<dt>
Since Extension Version
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
Description
</dt>
<dd>

The CSS color used to show issues in the ruler.

Depends upon [`cSpell.useCustomDecorations`](appearance#cspellusecustomdecorations).
Disable the ruler by setting [`cSpell.showInRuler`](appearance#cspellshowinruler) to `false`.

See:
- [`<color>` CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)
- [CSS Colors, W3C Schools](https://www.w3schools.com/cssref/css_colors.php)
- Hex colors

Examples:
- `green`
- `DarkYellow`
- `#ffff0080` - semi-transparent yellow.
- `rgb(255 153 0 / 80%)`

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

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_`"#348feb80"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

---


### `cSpell.showInRuler`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.showInRuler`

</dd>

<dt>
Description
</dt>
<dd>

Show spelling issues in the editor ruler.

Note: This setting is only used when [`cSpell.useCustomDecorations`](appearance#cspellusecustomdecorations) is `true`.

Note: To set the color of the ruler, use [`cSpell.overviewRulerColor`](appearance#cspelloverviewrulercolor).

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

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.35

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
Description
</dt>
<dd>

The CSS Style used to decorate spelling issues. Depends upon [`cSpell.useCustomDecorations`](appearance#cspellusecustomdecorations).

This setting is used to manually configure the text decoration. If it is not set, the following settings are used:
- [`cSpell.textDecorationLine`](appearance#cspelltextdecorationline) to pick the line type
- [`cSpell.textDecorationStyle`](appearance#cspelltextdecorationstyle) to pick the style
- [`cSpell.textDecorationColor`](appearance#cspelltextdecorationcolor) to set the color
- [`cSpell.textDecorationThickness`](appearance#cspelltextdecorationthickness) to set the thickness.

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

To change the ruler color, use [`cSpell.overviewRulerColor`](appearance#cspelloverviewrulercolor).

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

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

<dt>
Since Extension Version
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
Description
</dt>
<dd>

The decoration color for normal spelling issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)

To change the ruler color, use [`cSpell.overviewRulerColor`](appearance#cspelloverviewrulercolor).

Examples:
- `green`
- `yellow`
- `#ff0c`

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

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_`"#348feb"`_

</dd>

<dt>
Since Extension Version
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
Type
</dt>
<dd>

`string`

</dd>

<dt>
Scope
</dt>
<dd>

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_`"#f44"`_

</dd>

<dt>
Since Extension Version
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
Type
</dt>
<dd>

`string`

</dd>

<dt>
Scope
</dt>
<dd>

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_`"#cf88"`_

</dd>

<dt>
Since Extension Version
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
Description
</dt>
<dd>

The CSS line type used to decorate issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- line - `underline`, `overline`, see: [text-decoration-line, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line)

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

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_`"underline"`_

</dd>

<dt>
Since Extension Version
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
Description
</dt>
<dd>

The CSS line style used to decorate issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- style - `solid`, `wavy`, `dotted`, see: [text-decoration-style, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style)

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

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_`"dashed"`_

</dd>

<dt>
Since Extension Version
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
Type
</dt>
<dd>

`string`

</dd>

<dt>
Scope
</dt>
<dd>

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_`"auto"`_

</dd>

<dt>
Since Extension Version
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
Description
</dt>
<dd>

Draw custom decorations on Spelling Issues.
- `true` - Use custom decorations. - VS Code Diagnostic Severity Levels are not used.
- `false` - Use the VS Code Diagnostic Collection to render spelling issues.

Note: This setting overrides the VS Code Diagnostics setting: [`cSpell.diagnosticLevel`](reporting-and-display#cspelldiagnosticlevel).

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

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_`false`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

---


