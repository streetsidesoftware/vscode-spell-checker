# Copilot Instructions for vscode-spell-checker

## Overview

This repository contains **Code Spell Checker**, a VS Code extension that performs spell checking for source code. It uses a client/server architecture: the VS Code extension client communicates with a Language Server Protocol (LSP) server (`_server`) via JSON-RPC. A Svelte-based webview UI is used for the settings viewer.

## Repository Layout

```
/                          # Root: VS Code extension manifest (package.json)
packages/
  client/                  # VS Code extension client (TypeScript, runs in extension host)
  _server/                 # LSP spell-check server (TypeScript)
  _serverPatternMatcher/   # Pattern matching helpers for the server
  _integrationTests/       # VS Code integration tests (launch extension in real VS Code)
  json-rpc-api/            # JSON-RPC API helpers shared between client/server
  webview-api/             # Webview API types and models
  webview-rpc/             # Webview RPC helpers
  webview-ui/              # Svelte settings viewer UI
  utils-disposables/       # VS Code Disposable utilities
  utils-logger/            # Logging utilities
  __locale-resolver/       # Locale resolution helpers
  __utils/                 # Shared utility functions
scripts/                   # Build/release scripts
build/                     # Output .vsix extension packages
website/                   # Documentation website (separate npm project)
```

## Tech Stack

- **Language**: TypeScript (strict mode). Source files use `.mts` extension for ES modules.
- **Package manager**: `npm` with workspaces. Do NOT use `yarn` or `pnpm` — they are blocked in `package.json`.
- **Node.js**: v22+ (see `.nvmrc`)
- **Build**: `tsdown` + `tsc`
- **Tests**: [Vitest](https://vitest.dev/) (`vitest run`)
- **Linting**: ESLint (flat config in `eslint.config.js`) + Prettier
- **Spell checking**: CSpell (configured in `cspell.config.yaml`)
- **UI**: Svelte (webview-ui package only)

## Essential Commands

```bash
# Install dependencies (always run first after cloning or pulling changes)
npm install

# Build all packages
npm run build

# Run all tests
npm run test

# Lint (ESLint + Prettier auto-fix)
npm run lint

# ESLint only
npm run lint:eslint

# Prettier check only
npm run prettier:check

# Prettier auto-fix
npm run prettier:fix

# Build the .vsix extension package
npm run test-vsce-build

# Build a specific package (example: client)
npm --workspace=packages/client run build

# Test a specific package (example: _server)
npm --workspace=code-spell-checker-server run test
```

## Code Style

Configured in `.prettierrc.yaml` and `eslint.config.js`:

- **Indentation**: 4 spaces (2 spaces for YAML and Svelte files)
- **Quotes**: Single quotes for TypeScript/JavaScript; double quotes for JSON
- **Print width**: 140 characters
- **Line endings**: LF
- **Trailing commas**: Not used in JSON/Markdown/JSONC
- **TypeScript**: `strict`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, `strictNullChecks`
- **File extensions**: Use `.mts` for TypeScript ES modules; `.ts` for CommonJS-style TypeScript
- Imports are sorted automatically by `eslint-plugin-simple-import-sort`

## Testing

Tests use **Vitest** and are colocated with source files (e.g., `foo.test.mts` next to `foo.mts`).

```bash
# Run all tests across all workspaces
npm run test

# Run tests for one package
npm --workspace=packages/client run test

# Watch mode (development)
npm --workspace=packages/client run test-watch
```

Integration tests (launching a real VS Code instance) live in `packages/_integrationTests` and run separately in CI via `integration-test.yml`.

## Adding a New Configuration Setting

Follow these steps from `CONTRIBUTE.md`:

1. Add the field to `SpellCheckerSettings` in `packages/_server/src/config/cspellConfig/CSpellUserSettings.mts`, using JSDoc annotations for `@scope`, `@default`, etc.
2. Add the field name to `ConfigFields` in `packages/client/src/settings/configFields.ts`.
3. Regenerate the `package.json` schema:
    ```bash
    npm run build-package-schema
    npm --workspace=code-spell-checker-server run build
    ```
4. Use the setting in client code via `getSettingFromVSConfig(ConfigFields.myField, document)`.

## CI Workflows

| Workflow               | Trigger             | What it does                              |
| ---------------------- | ------------------- | ----------------------------------------- |
| `test.yml`             | PR / push to `main` | `npm ci`, `npm run build`, `npm run test` |
| `lint.yml`             | PR / push to `main` | cspell, ESLint, Prettier                  |
| `integration-test.yml` | PR / push to `main` | VS Code integration tests                 |
| `codeql-analysis.yml`  | Schedule / PR       | CodeQL security scan                      |

Website changes (`website/**`) are excluded from most CI triggers.

## Common Gotchas

- **Do not use `yarn` or `pnpm`** — `package.json` engines block them.
- **Run `npm install` before `npm run build`** — some packages depend on post-install patches (`patch-package`).
- **Spell check your code** — the `lint.yml` CI runs `cspell` on the whole repo. Add new technical words to `cspell-words.txt` if needed.
- **`.mts` files**: Most TypeScript source files use the `.mts` extension. Import paths must use `.mjs` extensions (e.g., `import { foo } from './foo.mjs'`) in `.mts` files because of `NodeNext` module resolution.
- **Schema generation**: After changing server settings, always regenerate the schema with `npm run build-package-schema`.
- **`noUnusedLocals` / `noUnusedParameters`**: TypeScript is strict — unused variables cause build failures.

## Architecture Notes

- The **client** (`packages/client`) runs inside the VS Code extension host and communicates with the **server** (`packages/_server`) over JSON-RPC using the VS Code Language Client library.
- The **server** uses `cspell` (npm package) for the actual spell-checking logic.
- The **webview UI** (`packages/webview-ui`) is a Svelte app embedded in a VS Code webview panel. It communicates with the extension host via the webview RPC (`packages/webview-rpc`).
- Shared API types between client and server live in `packages/json-rpc-api`.
- The root `package.json` is also the VS Code extension manifest (it contains `contributes`, `activationEvents`, etc.).
