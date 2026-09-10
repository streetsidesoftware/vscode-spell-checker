---
id: adding-words
title: Adding words
sidebar_position: 3
description: 'Add project terminology so that it is no longer reported.'
---

# Adding words

Not every unrecognized word is an error. Product names, identifiers, and domain terminology
are typically added to a dictionary rather than corrected.

## Add a single word

1. Place the cursor within the underlined word.
2. Open **Quick Fix**: `Cmd`+`.` (macOS) or `Ctrl`+`.` (Windows, Linux).
3. Choose one of the **Add: "word" to …** entries.

Alternatively, use `F1` and the **Add Word to Dictionary** command.

## Where words are stored

The destination determines who benefits from the addition:

| Destination          | Scope                                | Stored in                             |
| -------------------- | ------------------------------------ | ------------------------------------- |
| User dictionary      | Every project on the machine         | VS Code user settings                 |
| Workspace dictionary | The current workspace                | `cspell.json` in the workspace folder |
| Folder dictionary    | One folder of a multi-root workspace | That folder's `cspell.json`           |

For terminology that belongs to the project, prefer the workspace dictionary and commit
`cspell.json`. The same file is read by the [`cspell`](https://cspell.org) command-line tool,
so the local editor and continuous integration agree.

## Words that apply to one file only

Where a term appears in a single file, an in-document directive is often preferable to a
project-wide entry:

```js
// cSpell:words woorxs sweeetbeat
const companyName = 'woorxs sweeetbeat';
```

See [In-document settings](../guides/in-document-settings.md) for the full set of directives.

**Next:** [Choosing a language](./choosing-a-language.md)
