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
