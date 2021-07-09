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
1. `cspell` related

Configuration scope (based upon VS Code):

1. User - Follows the user.
1. Workspace - or project configuration is applied to a collection of folders (that may or may not be related).
1. Folder - the configuration to be applied to a directory hierarchy.

### Configuration Locations

1. `cspell` configuration files
   These include `cspell.json`, `cspell.config.yaml`, and `cspell.config.js`. When spell checking files,
   the spell checker searches the directory hierarchy looking for configuration files. If one is found,
   it will take precedence over any configuration stored in VS Code Settings.
1. VS Code Folder settings, generally found in a `.vscode/settings.json`.
1. VS Code Workspace settings, these are found in the open `*.code-workspace` file.
1. VS Code User settings, these are user based settings controlled by VS Code.
1. Code Spell Checker default settings.

VS Code and `cspell` have two different approaches to combining settings files.
VS Code uses a top down approach. The follow expression represents the VS Code logic
where `??` operator means take left value unless it is `null` or `undefined`, then take the right value.

```ts
cSpell.spellCheckDelayMs =
    folder.cSpell.spellCheckDelayMs ??
    workspace.cSpell.spellCheckDelayMs ??
    user.cSpell.spellCheckDelayMs ??
    defaults.cSpell.spellCheckDelayMs;
```

`cspell` uses and extends logic, which is similar to VS Code but some fields are merged instead of overwritten.

A `cspell.json` file can import multiple other configuration files, merging them in order.

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

## Adding terms to Dictionaries

The spell checker tries to make adding terms to dictionaries easy to do. The challenge is to make this an intuitive process.

With version V2 of the spell checker, the following logic is used for presenting target locations for adding words.

For words to be added to a dictionary file, the dictionary needs to have the `addWords` setting be `true`.
This can be accomplished in a few ways.

### Determine the "search" order on where to add words.

Always making the user choose where to add words can be annoying. Generally there is a logical choice. Where possible, we
should give that choice be default.

Possible destinations are:

1. Custom Dictionaries (might be scoped to _user_, _workspace_, _folder_, _not specified_)
1. CSpell config files.
1. VS Code Configuration (user, workspace, folder)

Not all destinations are equal. We want to prefer Custom Dictionaries over CSpell config files and CSpell config files over VS Code Configuration.
At the same time, the scope makes a difference. We want to prefer _folder_ over _workspace_ and that over _user_.

Here is a table of priority scores. Highest score should be chosen.

| scope     | Dictionary | CSpell | VS Code |
| --------- | ---------- | ------ | ------- |
| unknown   | 330        | 220    | -       |
| folder    | 330        | -      | 210     |
| workspace | 230        | -      | 200     |
| user      | 130        | -      | 110     |

The absolute values of the scores have no meaning. They are just used for relative comparison.

Priority should be strongly towards local (_folder_) over global (_user_).

Notes:

-   if a CSpell configuration file contains a custom dictionary definition it should not be part of the selection.
-   Adding words should not create a CSpell configuration file or a VS Code `settings.json` file is avoidable.
