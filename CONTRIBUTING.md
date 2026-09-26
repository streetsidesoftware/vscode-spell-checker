# vscode-spell-checker

[![](https://vsmarketplacebadges.dev/installs-short/streetsidesoftware.code-spell-checker.svg)](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
[![](https://vsmarketplacebadges.dev/rating-short/streetsidesoftware.code-spell-checker.svg)](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
[![](https://vsmarketplacebadges.dev/version-short/streetsidesoftware.code-spell-checker.svg)](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

[![Build & Test Actions Status](https://github.com/streetsidesoftware/vscode-spell-checker/workflows/build-test/badge.svg)](https://github.com/streetsidesoftware/vscode-spell-checker/actions)
[![Integration Tests Actions Status](https://github.com/streetsidesoftware/vscode-spell-checker/workflows/Integration%20Tests/badge.svg)](https://github.com/streetsidesoftware/vscode-spell-checker/actions)
[![Lint Actions Status](https://github.com/streetsidesoftware/vscode-spell-checker/workflows/lint/badge.svg)](https://github.com/streetsidesoftware/vscode-spell-checker/actions)

Thanks for considering a contribution to Code Spell Checker, the VS Code extension. The extension's Marketplace page
is the root [`README.md`](./README.md). The user documentation is the [website](https://streetsidesoftware.github.io/vscode-spell-checker).

## TL;DR

- **Set up:** `npm install`, then `npm run build` and `npm test`. npm only: `yarn` and `pnpm` are blocked.
- **Principles:** an action changes only what the user picked, and false positives stay low. See
  [Design principles](./docs/design-principles.md).
- **Settings and commands** are defined in TypeScript and generated into `package.json` and the website. Never edit the
  generated files. See [Settings and commands](./docs/settings-and-commands.md).
- **Before a PR:** `npm run build`, `npm test`, `npm run lint` (fixes what it can), and `npx cspell . --dot --no-progress`.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/). Release notes are read by people who use
  the extension, so `feat:` and `fix:` are only for changes they would notice.
- **PR descriptions:** short, with a `## Summary` that stands on its own.

## More docs

- [Build and packaging](./docs/build-and-packaging.md): workspace layout, tooling, the `.vsix`, and CI
- [Settings and commands](./docs/settings-and-commands.md): adding a setting or a command
- [Releasing](./docs/releasing.md): Release Please, prerelease mode, and publishing
- [Design principles](./docs/design-principles.md)
- [Glossary](./docs/glossary.md)
- [ADRs](./docs/ADRs/README.md): design decisions, one folder per feature
- [Design notes](./docs/design-notes/README.md): exploratory notes and ideas that haven't been decided

## Getting started

Use the Node.js version in `.nvmrc`.

```sh
npm install
npm run build
npm test
```

Run the tests of one package, or one file, from the repo root:

```sh
npm --workspace=packages/client run test
npm --workspace=packages/client run test -- src/settings/configFields.test.mts
```

## Running and debugging

### Run the extension

1. Open the workspace: `code "Spell Checker.code-workspace"`.
1. In the Run and Debug view, choose `Client: Launch Extension (Spell Checker Root)`.
1. Press `F5`.

### Debug the server

1. Launch the extension as above.
1. Choose `Server: Attach Server (Server - Spell Checker)` and start it.

The server listens for the debugger on port 60048. If attaching fails because the port is still in use, check with:

```bash
netstat -anp tcp | grep 60048
lsof -i tcp:60048
```

If anything shows up, the port is still held by an old process.

## Before submitting a pull request

```sh
npm run build
npm test
npm run lint
npx cspell . --dot --no-progress
```

- `npm run lint` runs ESLint and Prettier and writes their fixes. Use `npm run prettier:check` to check formatting
  without changing files.
- Add real words that cspell doesn't know to `cspell-words.txt`.
- CI also runs the integration tests, which launch the extension in VS Code. See
  [Build and packaging](./docs/build-and-packaging.md#integration-tests) to run them locally.

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/). Release Please builds the version bump and the
changelog from the commit type, and the changelog is read by people who use the spell checker. Pick the type by what
they would notice, not by how much code changed.

Shown in the release notes:

- `feat:`: something users can do that they couldn't before, such as a new setting, command, or file type.
- `fix:`: any other change users would notice: a bug fix, a changed default or behavior, a removal.
- `feat!:` / `fix!:`: either of the above, when it breaks existing setups.
- `perf:`: a speed-up users would notice, with no change in behavior.
- `revert:`: undoes a merged `feat:` or `fix:`.

Hidden from the release notes:

- `refactor:`: internal restructuring with no behavior change.
- `docs:`: documentation only, including the website.
- `style:`: formatting only.
- `test:`: tests only.
- `ci:`: GitHub Actions and workflows, including the automated dependency update PRs.
- `chore:`: everything else: tooling, dev dependencies, lint config, Claude Code skills.

Two kinds of `fix:` commit are on purpose, even though they aren't bug fixes:

- **cspell and dictionary updates** (`fix: Update CSpell from …`). cspell does the spell checking, so a new version
  changes what users see.
- **`fix: Prepare for Release`**, which turns off prerelease mode and starts a release. See
  [Releasing](./docs/releasing.md#prerelease-mode).

A scope is optional, for example `fix(website): …`.

Write the subject of a `feat:` or `fix:` commit for a user: say what changed for them, not how the code changed.

If a PR merged under the wrong type, see [Releasing](./docs/releasing.md#fixing-a-changelog-entry-after-merge).

## Pull request descriptions

Keep them short. Prefer bullet points over prose. A sentence with more than one or two `code` spans is hard to read:
break it into a list.

- `## Summary`: one or two sentences that stand on their own: what changed and why.
- `feat:` and `fix:` PRs are read by users deciding whether a change affects them.
    - Say which setting, command, or behavior changed, in their terms.
    - For `feat:`, add a `## Feature` section: what users can now do, and why it works the way it does.
    - Show a `settings.json` or cspell config snippet where it helps.
- `refactor:` and `chore:` PRs are for reviewers. Group the changes by theme, not by file, and say why each matters.
- Put extra detail in collapsed `<details>` blocks, as bullet points.
- No test plan section: CI covers that.
- After pushing more commits, check that the description still matches.

Don't restate the diff, narrate how you got to the change, or write a section per commit.

## Code style

Prettier and ESLint handle formatting and import order. Beyond that:

### Comments

Keep the mental cost of reading the code low. The code is the source of truth. A few accurate comments are better than
many long ones that drift out of date.

- Don't explain what the code does when the code already shows it. Explain why, only when it isn't obvious.
- A comment should never take longer to read than the code it describes.
- Don't discuss rejected alternatives, and give a reason once, not in every place it applies.
- Avoid a one-line comment with several clauses. Use a short multi-line list instead.
- Avoid a paragraph full of `code` references. Split it into sentences or a list.
- Keep comment lines to 140 characters or fewer.
- Doc comments on shared or exported code: one line on what it does, plus anything non-obvious about how to call it.
  Use `@param` and `@returns` only when they add information beyond the name and type.
- Tests: the test name states the intent. Comment only on setup that isn't obvious.
- Leave existing comments alone unless you are changing that function.

Settings doc comments are the exception: they are user documentation. See
[Settings and commands](./docs/settings-and-commands.md#1-define-it).

### Invisible characters

Write invisible and non-printing characters as escape sequences (`\u00a0`, `\u200b`, `\u2028`), including in strings,
regular expressions, and `case` labels. A literal invisible character can't be seen in a review, and editors can
silently change it.

Doc comments that are rendered as documentation can't use escapes. Where one needs an invisible character, such as a
zero-width space to keep `**/` from ending the comment, add `/* eslint-disable no-irregular-whitespace */` to the file,
as `packages/_server/src/config/cspellConfig/cspellConfig.mts` does.

## Writing for users

These rules apply to the root `README.md`, the website, settings descriptions, and `feat:`/`fix:` PR descriptions.

- Write for someone installing and using the extension, not for a contributor.
- Use absolute `https://` links.
- Don't start a sentence with a code span. Lead with a word: "Use `cSpell.words` to…".
- Label an example that is a whole file with its filename in bold, directly above the code block, for example
  **`.vscode/settings.json`** or **`cspell.config.yaml`**.
- Never edit between `@@inject` markers. Change the source and run `npm run build:readme`.
- Never edit the generated website pages (`auto_*.md`). See [Settings and commands](./docs/settings-and-commands.md).
- In a Markdown file with deliberate misspellings, list them in a `cspell:ignore` comment at the end of the file.

## Dictionaries / Word List

Improvements to existing word lists and new word lists are welcome.

All dictionaries have been migrated to [cspell-dicts](https://github.com/streetsidesoftware/cspell-dicts).

### Format for Dictionary Word lists

The simplest format is one word per line.

```text
apple
banana
orange
grape
pineapple
```

For programming languages, a word list might look like this:

```php
ZipArchive::addGlob
ZipArchive::addPattern
ZipArchive::close
ZipArchive::deleteIndex
ZipArchive::deleteName
ZipArchive::extractTo
```

The word list compiler will convert camelCase and snake_case words into a simple word list.
This is both for speed and predictability.

```php
ZipArchive::deleteIndex
```

becomes:

```text
zip
archive
delete
index
```

Spaces between words in the word list have a special meaning.

```text
New Delhi
New York
Los Angeles
```

becomes in the compiled dictionary:

```text
new delhi
new
delhi
new york
york
los angeles
los
angeles
```

Spaces in the compiled dictionary have a special meaning.
They tell the suggestion algorithm to suggest: 'newYork', 'new_york', 'new york', etc. for 'newyork'.

### Locales

The default language is English: `"cSpell.language": "en"`

CSpell currently has English locales: `en-US` and `en-GB`.

Example words differences: behaviour (en-GB) vs behavior (en-US)

<!---
    cSpell:ignore newyork lsof netstat
    cSpell:words behaviour behavior
-->
