---
id: install
title: Install
sidebar_position: 1
description: 'Install the VS Code Spell Checker and confirm that it is running.'
---

# Install

## From the Extensions view

1. Open the Extensions view: `Ctrl`+`Shift`+`X` (Windows, Linux) or `Cmd`+`Shift`+`X` (macOS).
2. Search for **code-spell-checker**.
3. Select **Code Spell Checker** by Street Side Software and choose **Install**.

## From the command line

```sh
code --install-extension streetsidesoftware.code-spell-checker
```

Substitute `code-insiders`, `cursor`, or `codium` for other builds. For VSCodium and other
Open VSX based editors, the extension is published to the
[Open VSX registry](https://open-vsx.org/extension/streetsidesoftware/code-spell-checker).

## Confirm that it is running

The spell checker adds an entry to the status bar. Open any Markdown or source file and type
a misspelled word, for example `recieve`. The word should receive a squiggly underline.

If nothing is underlined, see [Enabling file types](../guides/enable-file-types.md).

## No configuration is required

The extension operates with its default configuration. Spell checking is performed locally;
no document content is transmitted.

**Next:** [Making corrections](./making-corrections.md)

<!---
cspell:ignore recieve
--->
