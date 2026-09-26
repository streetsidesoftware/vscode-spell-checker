# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This repo is **Code Spell Checker**, a VS Code extension. The root `package.json` is both the extension manifest and the
npm workspace root.

## Commands

A fresh clone has no `node_modules`. Run `npm ci` before anything else. npm only: `yarn` and `pnpm` are blocked.

```sh
npm ci                     # install; .npmrc sets ignore-scripts, so no install scripts run
npm run build              # build every workspace, then regenerate the schema and package.json contributes
npm test                   # each workspace's test script: mostly vitest; not the integration tests
npm run lint               # eslint --fix, then prettier --write
npm run prettier:check     # formatting check, no changes
npx cspell . --dot --no-progress   # the spell check CI runs
npm run gen-docs           # regenerate website/docs auto_*.md from the schema and package.json
npm run test-vsce-build    # package temp/code-spell-checker.vsix
```

One package, one file, or one test:

```sh
npm --workspace=packages/client run test
npm --workspace=packages/client run test -- src/settings/configFields.test.mts
cd packages/client && npx vitest run src/settings/configFields.test.mts -t 'ConfigKeysByField'
```

- Build before testing.
    - The client imports `code-spell-checker-server/api` and `/lib`, which are built output.
    - `commands.test.mts` reads `package.json`, which only has a new command after a build.
- `npm run build` should leave `git status` clean unless you changed a setting or contribution. If it doesn't, commit
  the regenerated files.
- The integration tests (`npm run test-client-integration`) download VS Code and need a display (`xvfb-run -a` on
  Linux). Don't run them unless asked.
- Before finishing, run `npm run lint`, `npm test`, and the cspell check. `npm run lint` writes fixes, so check the diff
  afterwards.

## Where things are

Read the doc before changing that area. These are written for people too.

- [`docs/build-and-packaging.md`](docs/build-and-packaging.md): workspace layout, tooling, imports, the `.vsix`, CI.
- [`docs/settings-and-commands.md`](docs/settings-and-commands.md): how settings and commands are defined and
  generated, and the steps to add one.
- [`docs/releasing.md`](docs/releasing.md): Release Please, prerelease mode, publishing.
- [`docs/design-principles.md`](docs/design-principles.md): weigh every behavior change against these.
- [`docs/glossary.md`](docs/glossary.md): client, server, config target, and other terms used below.
- [`CONTRIBUTING.md`](CONTRIBUTING.md): commit types, PR descriptions, code style, and writing for users.

## Rules

### Generated files

Never edit these by hand. Change the source and regenerate (see `docs/settings-and-commands.md`):

- `package.json` → `contributes` (all of it)
- `packages/_server/spell-checker-config*.schema.json`
- `website/docs/**/auto_*.md`
- anything between `@@inject` markers, such as in `README.md` (`npm run build:readme`)
- `CHANGELOG.md` and `.release-please-manifest.json` (Release Please)
- the `vsce.preRelease` field in `package.json` (the Set Prerelease workflow)

### Imports

Relative imports name the output extension: `./foo.mjs` for `foo.mts`, and `./bar.js` for `bar.ts`. Some packages also
allow `.ts` extensions. Match the surrounding code.

### Comments

The code is the source of truth. Keep the mental cost of reading it low: a few accurate comments beat many long ones
that drift.

- Don't explain what the code already shows. Explain why, only when it isn't obvious.
- A comment should never take longer to read than the code it describes.
- No rejected alternatives. Give a reason once, not in every place it applies.
- No one-line comment with several clauses. Use a short multi-line list.
- No paragraph full of `code` references. Split it into sentences or a list.
- Comment lines stay at 140 characters or fewer.
- Doc comments on shared or exported code: one line on what it does, plus anything non-obvious about calling it.
  `@param` and `@returns` only when they add information beyond the name and type.
- Tests: the test name states the intent. Comment only on setup that isn't obvious.
- Leave existing comments alone unless you are changing that function, or you are asked to.

Settings doc comments in `packages/_server/src/config/cspellConfig/` are the exception. They are user documentation: the
Settings UI, the schema, and the website all show them. Write them for a user, with examples, following
`docs/settings-and-commands.md`.

### Invisible characters

Write invisible and non-printing characters as escape sequences (`\u00a0`, `\u200b`, `\u2028`), including in strings,
regular expressions, and `case` labels.

The one exception: a zero-width space in a doc comment, between `*` and `/`, so a glob pattern or a C-style block
comment in a Markdown code block doesn't end the comment. Doc comments can't use escapes. See `CONTRIBUTING.md`'s
"Invisible characters".

### Writing for users

The root `README.md` (the Marketplace page), the `website/` docs, settings descriptions, and `feat:`/`fix:` PR
descriptions are read by people who use the extension. Follow `CONTRIBUTING.md`'s "Writing for users". In short:

- Write for someone using the extension, not a contributor.
- Absolute `https://` links only.
- Don't start a sentence with a code span.
- Bold filename label above a whole-file example.
- `cspell:ignore` comment for deliberate misspellings.

`website/docs/` is for people who use the extension. `docs/` is for maintainers and contributors. Don't mix them.

### Docs for people

Guides and docs for people (`CONTRIBUTING.md`, `docs/`, the website) never point to this file. If a guide needs
something that's only here, move it into a doc under `docs/` and link to it from both.

In guides, give each step a heading and list its checks one per item.

### Commits and pull requests

Follow `CONTRIBUTING.md`'s "Commit messages" and "Pull request descriptions".

- Release notes are read by people who use the spell checker. `feat:` and `fix:` are only for changes they would notice.
- Work on this repo's tooling, docs, or Claude Code setup is `chore:` or `docs:`.
- After pushing more commits to an open PR, check that its description still matches.
- If a PR merged under the wrong type, use the `release-notes` skill.

### Designing a feature

For a feature with more than one reasonable design, use the `feature-adr` skill before writing code. It records
decisions in `docs/ADRs/<feature-slug>/`.

- `docs/ADRs/` holds decisions. `docs/design-notes/` holds exploratory notes that haven't been decided.
- Terms from ADRs go in `docs/ADRs/glossary.md`. Repo-wide concepts maintainers need to know go in `docs/glossary.md`.

## Architecture

- **Client** (`packages/client`): the extension, running in the VS Code extension host. Registers commands, menus,
  views, and code actions, and starts the servers.
- **Server** (`packages/_server`): the language server. Runs cspell and reports spelling issues. The client talks to it
  over the Language Server Protocol, with custom requests in `packages/_server/src/api/`.
- **Pattern matcher** (`packages/_serverPatternMatcher`): a second server for matching regular expressions.
- **Webview** (`packages/webview-ui`, a Svelte app): shown in the Spell Checker info view. It talks to the extension
  through `packages/webview-rpc`, with shared types in `packages/webview-api`.
- **Settings** are TypeScript types with doc comments in `packages/_server/src/config/cspellConfig/`. The schema,
  `package.json` `contributes.configuration`, and the website settings pages are generated from them.
- **Commands, menus, and views** are declared in `packages/client/src/contributes/` and generated into `package.json`.
  Command handlers are in `packages/client/src/commands.mts`.

The full package list is in `docs/build-and-packaging.md`.

## Dependencies

Dependabot (`.github/dependabot.yml`) and the `update-dependencies.yml` and `update-cspell.yml` workflows open the
update PRs. CSpell and dictionary updates are `feat:` (major or minor) or `fix:` (patch), set by `update-cspell.yml`.
Don't reclassify them: cspell does the checking, so users see the change.
