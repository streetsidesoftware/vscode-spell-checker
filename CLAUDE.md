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

These rules are written for people in the linked docs. Read the section before working in that area.

- **Generated files:** never edit them by hand. Change the source and regenerate. The list and the command for each are
  in [`docs/build-and-packaging.md`](docs/build-and-packaging.md#generated-files).
- **Imports:** relative imports name the output extension (`.mjs` for `.mts`). See
  [Source files and imports](docs/build-and-packaging.md#source-files-and-imports).
- **Comments:** few, short, and accurate; the code is the source of truth. Leave existing comments alone unless you are
  changing that function or are asked to. Settings doc comments are user documentation. See
  [Comments](CONTRIBUTING.md#comments).
- **Invisible characters:** write them as escape sequences. The one exception is in doc comments. See
  [Invisible characters](CONTRIBUTING.md#invisible-characters).
- **Writing for users:** the root `README.md`, `website/`, settings descriptions, and `feat:`/`fix:` PR descriptions
  are read by people who use the extension. See [Writing for users](CONTRIBUTING.md#writing-for-users).

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

For a feature with more than one reasonable design, follow [`docs/ADRs/README.md`](docs/ADRs/README.md) before writing
code. The `feature-adr` skill runs that process as an interview.

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
