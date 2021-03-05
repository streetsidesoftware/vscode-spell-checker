# Configuration

Configuration controls the behavior of the spell checker.

One of the goals of the Code Spell Checker extension is to work right out of the box without needing to be configured by the user.
To do that special care is made to make sure the right set of defaults are used.

This document describes how the extension and cspell library can be configured.

At its core, the configuration determines:

1. Which files get checked
1. Which parts of a file are checked
1. Which dictionaries are used while checking a file.

There are two main categories of configuration:

1. Extension related
1. cspell related

Configuration scope (based upon VS Code):

1. User - Follows the user.
1. Workspace - or project configuration is applied to a collection of folders (that may or may not be related).
1. Folder - the configuration to be applied to a directory hierarchy.

## Extension Related Configuration

Controls things like:

1. If the extension is enabled / disables
1. The filetypes to spell check
1. How often to spell check a file (time delay between checks)
1. How much of a file to check.
1. How to report on issues found.
1. Which files to check / ignore (overlaps with the CSPELL configuration).
1. Add to dictionary destination -- Where to store user words.

## CSPELL configuration files.

Controls things like:

1. Which files to spell check or ignore (based upon glob patterns).
1. Which dictionaries to use
1. Which part of a file to check.
1. Which words to ignore or forbid.

The main way to define cspell configuration is to use a configuration file like `cspell.json`
or one of the alternatives.

## Configuration Logic

How to determine the configuration used for a file.

| Configuration | Description                                       |
| ------------- | ------------------------------------------------- |
| user          | VS Code User level configuration                  |
| workspace     | VS Code Workspace configuration                   |
| folder        | VS Code Folder configuration                      |
| folder cspell | Nearest cspell configuration found in folder      |
| file cspell   | Nearest cspell configuration relative to the file |

The configuration from VS Code is the merge of the `user`, `workspace`, and `folder`
configurations where `folder` values take precedence over `workspace` and `workspace` takes precedence of `user`.

```
config[key] = folder[key] ?? workspace[key] ?? user[key]
```
