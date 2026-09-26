# Settings and commands

The extension's settings and commands are defined in TypeScript. The settings schema, the `contributes` section of the
root `package.json`, and the website's reference pages are all generated from those definitions.

## What is generated

Never edit these by hand. Change the source, then regenerate.

| Generated file                                                         | Source                                           | Regenerate with    |
| ---------------------------------------------------------------------- | ------------------------------------------------ | ------------------ |
| `packages/_server/spell-checker-config.schema.json`                    | `packages/_server/src/config/cspellConfig/*.mts` | `npm run build`    |
| `packages/_server/spell-checker-config-web.schema.json`                | same                                             | `npm run build`    |
| `package.json` → `contributes.configuration`                           | `spell-checker-config.schema.json`               | `npm run build`    |
| `package.json` → the rest of `contributes` (commands, menus, views, …) | `packages/client/src/contributes/*.ts`           | `npm run build`    |
| `website/docs/configuration/auto_*.md`                                 | `spell-checker-config-web.schema.json`           | `npm run gen-docs` |
| `website/docs/auto_commands.md`                                        | `package.json` → `contributes.commands`          | `npm run gen-docs` |

How it fits together:

- `npm run build` ends with `build:schema`, which runs the server's `build-schema` script and then
  `build-tools update-package-schema`. The second step writes both the schema and the client's contributions into the
  root `package.json`.
- `npm run gen-docs` runs the website's `gen-commands` and `gen-config` scripts.
- The `build-website-docs.yml` workflow also regenerates the website pages each week and opens a PR.

## Adding a setting

### 1. Define it

Add the property, with its doc comment, to the matching interface in
`packages/_server/src/config/cspellConfig/`. Most extension settings live in `SpellCheckerSettings.mts`. Appearance,
file type and scheme, and custom dictionary settings have their own files.

The doc comment is what users see: it becomes the description in the Settings UI, the schema, and the website.

- Write for a user: what the setting does, and when to change it.
- Add an example where it helps.
- Don't start a sentence with a code span.
- Use the tags the schema generator reads:
    - `@title`
    - `@scope`: this repo uses `application`, `window`, `resource`, and `language-overridable`
    - `@default`
    - `@enumDescriptions`
    - `@sinceVersion` for the extension version that adds it
    - `@deprecated` and `@deprecationMessage`
    - `@markdownDescription`, `@patternErrorMessage`, `@note`, and `@order` where needed

    The extra tags are listed in `extraTags` in `packages/_server/scripts/build-schema.mts`.

### 2. Put it in a section

The settings are split into sections (Reporting and Display, Performance, Appearance, …) by the `_VSConfig*` types in
`packages/_server/src/config/cspellConfig/cspellConfig.mts`.

- Add the property name to the section's `Pick<…>` list.
- A property that isn't in any section ends up in the "CSpell" section.

### 3. Add it to `ConfigFields`

Add it to `ConfigFields` in `packages/_server/src/config/cspellConfig/configFields.mts`. The type requires every
setting, so a missing entry is a type error.

### 4. Regenerate

```sh
npm run build
npm run gen-docs
```

Check the diff:

- `package.json` has the new setting under `contributes.configuration`.
- Both schema files changed.
- The matching `website/docs/configuration/auto_*.md` page describes it.

### 5. Use it

In the client, read it with `getSettingFromVSConfig(ConfigFields.mySetting, document)` from
`packages/client/src/settings/vsConfig.mts`.

## Adding a command

### 1. Declare it

Add it to `commands` in `packages/client/src/contributes/commands.ts`.

- The id starts with `cSpell.`. A test checks this.
- Add it to menus in `packages/client/src/contributes/menus.ts` if it belongs in one.

### 2. Implement it

Add a handler to `_commandHandlers` in `packages/client/src/commands.mts`. A test in `commands.test.mts` checks that every
command in `package.json` has a handler, so it only sees a new command after `npm run build`.

### 3. Regenerate

```sh
npm run build
npm run gen-docs
```

Check the diff:

- `package.json` has the command under `contributes.commands`.
- `website/docs/auto_commands.md` lists it.
