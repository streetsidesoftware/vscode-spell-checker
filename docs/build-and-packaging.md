# Build and packaging

How the extension is laid out, built, tested, and packaged into a `.vsix`. For how settings and commands get into
`package.json`, see [Settings and commands](./settings-and-commands.md).

## Workspace layout

This is an npm workspaces monorepo. The root `package.json` has two roles:

- It is the VS Code extension manifest (`contributes`, `activationEvents`, `main`, …).
- It is the workspace root, with the scripts that build, test, and lint everything.

| Directory                        | npm workspace name                 | What it is                                                       |
| -------------------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| `packages/client`                | `client`                           | The extension itself. Runs in the VS Code extension host.        |
| `packages/_server`               | `code-spell-checker-server`        | The language server. Runs cspell and reports spelling issues.    |
| `packages/_serverPatternMatcher` | `@internal/server-pattern-matcher` | A separate server for matching regular expressions against text. |
| `packages/_integrationTests`     | `@internal/integration-tests`      | Tests that launch the extension in a real VS Code.               |
| `packages/json-rpc-api`          | `json-rpc-api`                     | JSON-RPC helpers shared by client and server.                    |
| `packages/webview-api`           | `webview-api`                      | Types and models shared by the extension and the webview.        |
| `packages/webview-rpc`           | `vscode-webview-rpc`               | RPC between the extension and the webview.                       |
| `packages/webview-ui`            | `webview-ui`                       | The Svelte app shown in the Spell Checker info view.             |
| `packages/utils-disposables`     | `utils-disposables`                | Disposable helpers.                                              |
| `packages/utils-logger`          | `utils-logger`                     | Logging helpers.                                                 |
| `packages/__locale-resolver`     | `@internal/locale-resolver`        | Locale and language code lookup.                                 |
| `packages/__utils`               | `@internal/common-utils`           | Shared utilities.                                                |
| `tools/build-tools`              | `build-tools`                      | Writes the schema and client contributions into `package.json`.  |
| `scripts`                        | `@internal/scripts`                | Release helper scripts.                                          |
| `website`                        | `@internal/website`                | The Docusaurus website, for people who use the extension.        |

`tools/vitest-config` (`@internal/vitest-config`) is not a workspace. It is a `file:` dev dependency with the shared
vitest configuration.

## Tooling

- **npm only.** `yarn` and `pnpm` are blocked by `engines` in `package.json`. CI installs npm 11 (see
  `.github/actions/setup-node`).
- **Node.js** version is in `.nvmrc`.
- **Install scripts don't run.** `.npmrc` sets `ignore-scripts = true`, so no `preinstall`, `install`, or `postinstall`
  script runs, including the root `postinstall` (`patch-package`). There is no `patches/` directory.
- **Builds use tsdown, tsc, or vite, depending on the package:**
    - `client`, `_server`, and `_serverPatternMatcher` bundle with tsdown. Type declarations come from tsdown's `dts`
      option.
    - In `client` and `_server`, `tsc` only type-checks (`noEmit: true`).
    - `webview-ui` builds with vite. Its `test` script runs `tsc` and `svelte-check`.
    - The other packages build with `tsc` only.
- **Tests use vitest**, colocated with the source (`foo.test.mts` next to `foo.mts`). Exceptions:
    - `webview-ui`'s `test` script runs `tsc` and `svelte-check`.
    - `webview-rpc` and `tools/build-tools` have no tests yet.
    - The integration tests run separately; see below.
- **Lint** is ESLint (`eslint.config.js`) plus Prettier (`.prettierrc.yaml`).
    - `npm run lint` fixes what it can, and writes the fixes.
    - `npm run prettier:check` checks formatting without changing files.
- **Spelling** is checked with cspell (`cspell.config.yaml`). Add real words the dictionaries don't know to
  `cspell-words.txt`.

## Source files and imports

- Most source files are `.mts`. Some are `.ts`.
- Relative imports name the output extension: import `foo.mts` as `./foo.mjs`, and `bar.ts` as `./bar.js`.
- `packages/client` and `tools/build-tools` also allow `.ts` extensions in imports. Follow what the surrounding code
  does.
- TypeScript is strict everywhere.
- `noUnusedLocals` and `noUnusedParameters` are set in `tsconfig.base.json`. Only the packages that extend it (through
  `tsconfig.packages.base.json`) fail on unused code: `client`, `_server`, `_serverPatternMatcher`,
  `__locale-resolver`, and `tools/build-tools`. The others extend `@tsconfig/node22` directly.

## Build outputs

- `npm run build` builds every workspace and then regenerates the settings schema and `package.json` `contributes`
  (see [Settings and commands](./settings-and-commands.md)). After a build, `git status` should be clean unless you
  changed a setting or a contribution.
- The client bundles into `packages/client/dist/extension.cjs`, which is the manifest's `main`.
- The server bundles into `packages/_server/dist/main.cjs`.
- The client imports the server's shared code as `code-spell-checker-server/api` and `code-spell-checker-server/lib`.
  Both are built output. Build before running the client's tests after changing the server.

## Generated files

Never edit these by hand. Change the source, then regenerate.

| Generated                                                                             | Regenerate with                                                               |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `package.json` → `contributes`, the settings schemas, and `website/docs/**/auto_*.md` | See [Settings and commands](./settings-and-commands.md#what-is-generated)     |
| Anything between `@@inject` markers, such as in `README.md`                           | `npm run build:readme`                                                        |
| `CHANGELOG.md` and `.release-please-manifest.json`                                    | Release Please (see [Releasing](./releasing.md))                              |
| The `vsce.preRelease` field in `package.json`                                         | The Set Prerelease workflow (see [Releasing](./releasing.md#prerelease-mode)) |

## Packaging the `.vsix`

- `npm run test-vsce-build` packages the extension into `temp/code-spell-checker.vsix`. CI runs it on Linux to check
  that packaging works.
- `npm run package-extension` packages into `build/`. The release workflows use it.
- Both run `vscode:prepublish` first, which does a production build and removes test files from the build output.
- `.vscodeignore` lists what goes into the `.vsix`. It excludes everything, then adds back what the extension needs:
  the bundled client and server, the cspell dictionaries, and a few resources. A new runtime file that is missing from
  it builds fine and then fails in the installed extension.
- The root `README.md` is the Marketplace page, and `CHANGELOG.md` ships in the `.vsix`.

## Integration tests

`packages/_integrationTests` launches the built extension in a downloaded VS Code.

- Run them with `npm run test-client-integration`, after `npm run build`.
- On Linux without a display, run under `xvfb-run -a`, as CI does.
- `npm test` does not run them.

## CI

| Workflow               | Runs on                                       | What it does                                                                                   |
| ---------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `test.yml`             | PRs and `main`                                | `npm ci`, `npm run build`, and `npm run test` on Linux and Windows; `test-vsce-build` on Linux |
| `lint.yml`             | PRs and `main`                                | `cspell` over the repo, then `npm run build` and `npm run lint`                                |
| `integration-test.yml` | PRs and `main`                                | The integration tests, on stable, insiders, and the minimum VS Code version                    |
| `lint-docs.yml`        | All PRs, and `main` when `website/**` changes | cspell and Prettier on the website                                                             |
| `codeql-analysis.yml`  | PRs, `main`, and a schedule                   | CodeQL                                                                                         |

`test.yml`, `lint.yml`, and `integration-test.yml` skip changes that only touch `website/**`. For the release workflows, see [Releasing](./releasing.md).
Dependency updates come from Dependabot and from the `update-dependencies.yml` and `update-cspell.yml` workflows.
