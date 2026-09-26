# Design principles

Principles that guide how the extension behaves. Weigh new features and changes against them. When a feature designed
with an ADR sets a new principle, add it here with a link to the feature.

## An action changes only what the user picked

A command, quick fix, or menu action changes only the target the user chose, and has no hidden side effects. For
example:

- "Add Word to Workspace Settings" writes to the workspace settings and nowhere else.
- It doesn't also create a `cspell.json`, update another settings scope, or tidy up other entries.

This holds even when a side effect would save the user a step or keep the configuration tidier. The extension writes to
files people own and review: their settings, cspell config files, and dictionaries. An edit they didn't ask for is a
surprise, and a surprise in their files costs trust.

When an action seems to need a second change, make that a separate step the user takes, or ask first.

## Keep false positives low

The goal is to catch common spelling mistakes while flagging as few correct words as possible.

- When in doubt, don't flag a word.
- A spell checker that flags too much gets ignored or turned off, and then it catches nothing.
- Prefer defaults that are quiet and accurate. Leave stricter checking as something a user turns on.
