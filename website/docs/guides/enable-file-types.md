---
id: enable-file-types
title: Enabling file types
sidebar_position: 2
description: 'Turn spell checking on or off for a file type, from the status bar or the settings.'
---

# Enabling file types

Checking is enabled for around 25 file types out of the box. A file type outside that set —
or one you would rather not have checked — is switched with a single control, and the choice
is stored in your settings.

## Enabled by default

AsciiDoc · C, C++ · C# · css, less, scss · Dart · Elixir · Go · Html · Java · JavaScript ·
JSON / JSONC · LaTeX · Markdown · PHP · PowerShell · Pug / Jade · Python · reStructuredText ·
Ruby · Rust · Scala · SQL · Text · TypeScript · YAML

If your file is not underlined and its type is absent from that list, that is the reason.

## Toggle from the status bar

1. Open a file of the type in question.
2. Click the Spell Checker item in the status bar.
3. On the information screen, use the checkbox for the file type.

The status bar item also tells you the current state at a glance: it is the quickest way to
answer "is this file being checked at all?" before investigating anything else.

## Configure in the settings

The status bar toggle writes to
[`cSpell.enabledFileTypes`](/docs/configuration/files-folders-and-workspaces#cspellenabledfiletypes).
Editing the setting directly is worth doing when you want the same list committed to a
repository, or applied across a team.

```jsonc
{
    // Enable / disable checking file types (languageIds).
    "cSpell.enabledFileTypes": {
        "go": true,
        "javascript": true,
        "markdown": true,
        "plaintext": true,
        "typescript": true,
        "yaml": true,
        "sql": true
    }
}
```

The keys are VS Code language identifiers, not file extensions — `plaintext` rather than `txt`,
`typescriptreact` rather than `tsx`. To find the identifier for the file in front of you, run
**Change Language Mode** from `F1`; the identifier is shown beside each entry. A key of `*` is a
wildcard that enables all file types, so `{ "*": true, "json": false }` checks everything except
JSON.

Placing the setting in `.vscode/settings.json` applies it to one workspace; placing it in your
user settings applies it everywhere.

> `cSpell.enabledFileTypes` replaces the older `cSpell.enabledLanguageIds` (a plain list of
> identifiers to enable). If you still have `cSpell.enabledLanguageIds` in your settings, move
> its entries into `cSpell.enabledFileTypes` — see
> [Legacy settings](/docs/configuration/legacy#cspellenabledlanguageids).

### Whether the list is an allow list or a block list

[`cSpell.checkOnlyEnabledFileTypes`](/docs/configuration/files-folders-and-workspaces#cspellcheckonlyenabledfiletypes)
decides how `cSpell.enabledFileTypes` is read:

- `true` (the default) — only the file types listed as `true` are checked; everything else is
  skipped. This is the "around 25 file types out of the box" behavior described above.
- `false` — every file type is checked _except_ the ones you explicitly set to `false`.

Set it to `false` when it is easier to name the handful of file types to exclude than to list
everything you want included.

## Related, but different

Other settings affect which files get checked, but answer a different question than "which file
types":

- **A whole file or folder should never be checked** — that is a path exclusion, not a file
  type. Use
  [`cSpell.ignorePaths`](/docs/configuration/files-folders-and-workspaces#cspellignorepaths) or
  [`cSpell.files`](/docs/configuration/files-folders-and-workspaces#cspellfiles); see
  [Files, folders, and workspaces](/docs/configuration/files-folders-and-workspaces).
- **A document isn't a regular file on disk** — for example an `untitled` buffer, a Source
  Control commit message, or a virtual file system — that is controlled by
  [`cSpell.enabledSchemes`](/docs/configuration/files-folders-and-workspaces#cspellenabledschemes),
  not by file type.
- **One file needs an exception** — a directive in the file is lighter than a settings
  change; see [In-document settings](./in-document-settings.md).

## Turning the checker off entirely

[`cSpell.enabled`](/docs/configuration/code-spell-checker#cspellenabled) controls the extension
as a whole, independently of file types:

```jsonc
{
    "cSpell.enabled": false
}
```

**See also:** [How code is analyzed](../getting-started/how-it-works.md) ·
[Configuration](/docs/configuration)
