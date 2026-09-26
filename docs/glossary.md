# Glossary

Terms and concepts a maintainer needs to know: about the extension, cspell, and VS Code. Alphabetical.

Terms introduced by a single feature's ADRs are in the [ADR glossary](./ADRs/glossary.md).

## Client

The extension code that runs in the VS Code extension host: `packages/client`. It registers commands, menus, views,
and code actions, and starts the [server](#server). Bundled into `packages/client/dist/extension.cjs`.

## Config target

Where a change such as "add word" is written. A target has a kind and a scope:

- **Kind**:
    - `vscode`: VS Code settings (`cSpell.*`)
    - `cspell`: a [cspell configuration file](#cspell-configuration-file)
    - `dictionary`: a [custom dictionary](#custom-dictionary) file
- **Scope**: `user`, `workspace`, or `folder`

Defined as `ClientConfigTarget` in `packages/client/src/settings/clientConfigTarget.ts`, and as `ConfigTarget` in
`packages/_server/src/config/configTargets.mts`.

## cspell

The spell checker library that does the actual checking, published on npm as `cspell` and `cspell-lib`. The extension
bundles it. A new cspell version changes what users see, which is why its updates are listed in the release notes.

## cspell configuration file

A file such as `cspell.json` or `cspell.config.yaml` that configures cspell for a project. The same file works with the
cspell command-line tool. The file names the extension looks for are in
`packages/client/src/defaultConfigFilenames.mts`.

Compare with [VS Code settings](#vs-code-settings). Whether VS Code settings are also applied when a configuration file
exists is controlled by `cSpell.mergeCSpellSettings`.

## Custom dictionary

A word-list file that a user adds, set up through `cSpell.customDictionaries`. With `addWords: true`, the "add word"
actions can write to it.

## Dictionary bundles

The extension ships two dictionary packages. Both are updated by the same workflow as [cspell](#cspell).

- `@cspell/cspell-bundled-dicts`: the dictionaries that come with cspell. Its version follows cspell's.
- `@cspell/dict-cspell-bundle`: the dictionaries included with the cspell command-line tool. This is the "Dictionary
  Bundle" named in the update PR titles.

## File type

A VS Code language ID, such as `typescript` or `markdown`. Which file types are checked is set by
`cSpell.enabledFileTypes`, which replaces the older `cSpell.enabledLanguageIds` and `cSpell.enableFiletypes`.

## Prerelease mode

`"vsce": { "preRelease": true }` in the root `package.json`. While it's set, releases are published as Marketplace
pre-releases. Changed only by the Set Prerelease workflow. See [Releasing](./releasing.md#prerelease-mode).

## Scheme

The URI scheme of a document, such as `file`, `untitled`, or `vscode-scm` (commit messages). Which schemes are checked
is set by `cSpell.enabledSchemes`.

## Server

The language server that runs cspell and reports spelling issues: `packages/_server`. It runs in its own process, and
the [client](#client) talks to it over the Language Server Protocol. The custom requests between them are defined in
`packages/_server/src/api/`.

## VS Code settings

Settings under `cSpell.*` in the user, workspace, or folder settings. They are defined in TypeScript and generated into
`package.json`; see [Settings and commands](./settings-and-commands.md).

## Webview

HTML UI hosted inside VS Code. The Spell Checker info view (`cSpellInfoView`) shows the Svelte app in
`packages/webview-ui`. It talks to the extension through `packages/webview-rpc`, with shared types in
`packages/webview-api`.
