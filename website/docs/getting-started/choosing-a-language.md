---
id: choosing-a-language
title: Choosing a language
sidebar_position: 4
description: 'Set the spell checking locale and install additional dictionaries.'
---

# Choosing a language

## English variants

United States English is used by default. To use British English:

```jsonc
{
    "cSpell.language": "en-GB"
}
```

`en`, `en-US`, and `en-GB` are supported without an additional dictionary.

## Additional languages

Other languages are distributed as separate dictionary extensions. Install the extension for
the language, then add its locale to `cSpell.language`:

```jsonc
{
    "cSpell.language": "en,nl"
}
```

Multiple locales may be listed. A word is accepted if it appears in any active dictionary.

See [Add-on dictionaries](/docs/extensions) for the complete list of available language and
technical dictionaries.

## Per-file locale

The locale may also be set within a document:

```js
// cSpell:locale fr,en
```

**Next:** [How code is analyzed](./how-it-works.md)
