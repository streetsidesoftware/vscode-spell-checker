# Settings

Settings, Configuration, and Preferences

## `cSpell.configLocation`

A resource level setting that specifies the location of the `cspell.json` file.

## `cSpell.userWordsUrl`, `cSpell.wordsUrl`, `cSpell.ignoreWordsUrl`

## Raw Notes

-   need setting to indicate that settings should use `cspell.json` by default.
-   need to be able to specify the location of user words, words, ignore words, and forbid words.
-   would like to have a format for a single list of words that represents words / ignore / forbid.
    -   Use the format for cspell 5
        -   `!` indicates forbidden
        -   `+` indicates compound required
        -   `*` indicates optional compound
        -   ` ` (don't know yet) indicates do not suggest.

# Add Remove Locale

## Logic

### Scope

When adding / removing locales, the scope is either Global or Workspace.
Global - means it is possible to adjust any configuration.
Workspaces - means it is possible to adjust any configuration that is not Global.

-   Targets are presented from Locale to Global.
-   Targets _Inherit_ their values from Global to Local.

### Adding Locale

1. Only present targets that will have an impact.
1. If no targets will have an impact, then present any target that can be changed.
1. If there is only 1 target, then perform action without asking.

### Removing Locale

1. Only present targets that will have an impact.
1. If no targets will have an impact, do nothing.
1. If there is only 1 target, then perform action without asking.

# Toggle Enable Spell Checker

## Logic

There are currently two different target scopes (Workspace and Global). These are really max level of influence.

The goal of the Toggle is to turn on / off the spell checker in a intuitive and predictable way. In other words:

> If the spell checker is currently off for the file I have open, I want it on and vice versa.

The logic to the Toggler is as follows:

-   Find the most local configuration with the `enable` value set.
-   Remove it if it will become the same as the inherited value otherwise set it to the negation.

Having a scope of Workspace prevents the Global value from being updated, but the rest of the logic is the same.
