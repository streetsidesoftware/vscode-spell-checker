---
layout: default
title: Release Notes v2.0
categories: release-notes
parent: Release Notes
nav_order: 4
---

# Version 2.0

## Highlights

- By default, only files in a workspace are spell checked.
- Be able to specify which files to check by adding globs to `files` setting.
- Spelling suggestions available from the context menu.
- Improved context menu options.
- Upgrades [cspell](https://www.npmjs.com/package/cspell) to version 5.9.0.
- Supports case sensitive dictionaries. See: [Turning on case sensitive spell checking](#turning-on-case-sensitive-spell-checking)
- Full support of Yaml configuration files: `cspell.config.yaml`
- Full support of configuration in `package.json` under `cspell` section.
- Partial support of JavaScript configuration files: `cspell.config.js`
  The extension supports reading the configuration but can only write to `.json` and `.yaml` files.
- Supports dictionary entries that have numbers and mixed case.
- Supports more word splitting formats
  It correctly splits both `ERRORcode` and `ERRORCode`
- Reduced installation size and faster loading
- Added Commands to move between issues in a document. See: [Previous and Next Issue Commands](#previous-and-next-issue-commands)

## Manual Installation

- Download and decompress `code-spell-checker.zip` from [VS Code Spell Checker Releases](https://github.com/streetsidesoftware/vscode-spell-checker/releases)
- From VS Code Install from VSIX `code-spell-checker-2.0.2.vsix`
  ![image](https://user-images.githubusercontent.com/3740137/120071300-f0a27600-c08e-11eb-9828-155be0405510.png)

# Features

## Previous and Next Issue Commands

| Command                                      | Description                               |
| -------------------------------------------- | ----------------------------------------- |
| `cSpell.goToNextSpellingIssue`               | Go to Next Spelling Issue                 |
| `cSpell.goToPreviousSpellingIssue`           | Go to Previous Spelling Issue             |
| `cSpell.goToNextSpellingIssueAndSuggest`     | Go to Next Spelling Issue and Suggest     |
| `cSpell.goToPreviousSpellingIssueAndSuggest` | Go to Previous Spelling Issue and Suggest |

## Turning on case sensitive spell checking

See: [Case Sensitivity - CSpell](https://streetsidesoftware.github.io/cspell/docs/case-sensitive/)

**VS Code UI**

![image](https://user-images.githubusercontent.com/3740137/129460586-498f1bf4-3b53-43d6-b525-7ad283b8e8bf.png)

**VS Code `settings.json`**

```jsonc
"cSpell.caseSensitive": true
```

**`cspell.json`**

```jsonc
"caseSensitive": true
```

**For a file type: `markdown`**
`cspell.json`

```jsonc
"languageSettings": [
    { "languageId": "markdown", "caseSensitive": true }
]
```

**For a file extension: `*.md`**
`cspell.json`

```jsonc
"overrides": [
    { "filename": "*.md", "caseSensitive": true }
]
```

## Making Words Forbidden

See: [How to Forbid Words - CSpell](https://streetsidesoftware.github.io/cspell/docs/forbidden-words/)

# Contributions

- [elazarcoh](https://github.com/elazarcoh) - added previous/next issue commands.

<!---
cspell:ignore elazarcoh
--->
