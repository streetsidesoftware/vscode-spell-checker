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
- A glob pattern or a `/* ... */` comment in an example's code block needs a zero-width space between `*` and `/`.
  See [`CONTRIBUTING.md`](../CONTRIBUTING.md#invisible-characters).
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

A section is built in one of two ways, and a new setting joins it differently:

- **From a whole interface.** Appearance (`AppearanceSettings`) and Menus and Actions (`MenusAndActions`) take every
  property of their interface. Adding the property to that interface is enough.
- **From a `Pick<…>` list.** The other sections list property names, some alongside a whole interface (for example
  `keyof AdvancedSettings`). Add the name to the list, unless the property's interface is already included.

A setting that only the extension has must be in a section. If it isn't, `unusedConfig` in `cspellConfig.mts` fails the
type check. Settings that come from cspell itself (`CSpellUserSettings` in `@cspell/cspell-types`) and aren't in a
section go to the "CSpell" section.

### 3. Add it to `ConfigFields`

Add it to `ConfigFields` in `packages/_server/src/config/cspellConfig/configFields.mts`. The type requires every
setting, so a missing entry is a type error.

### 4. Add its default to `configDefaults`

If the setting has a `@default`, add the same value to `configDefaults.mts` in the same folder: the key to
`ConfigFieldsWithDefaults`, and the value to `configDefaults`. The code reads defaults from there. A test in
`configDefaults.test.mts` checks that it matches every `@default` in the generated schema.

### 5. Regenerate

```sh
npm run build
npm run gen-docs
```

Check the diff:

- `package.json` has the new setting under `contributes.configuration`.
- Both schema files changed.
- The matching `website/docs/configuration/auto_*.md` page describes it.

### 6. Use it

- **In the client,** read it with `getSettingFromVSConfig(ConfigFields.mySetting, document)` from
  `packages/client/src/settings/vsConfig.mts`.
- **In the server,** it arrives with no extra wiring. The server asks VS Code for the whole `cSpell` section
  (`packages/_server/src/config/documentSettings.mts`), and the client tells it when that section changes.
- **Merging with cspell config files:** a setting only the extension reads needs nothing. A field that cspell itself
  reads may need an entry in `cspellMergeFields.mts`.

### 7. Test it

- Add tests next to the code that uses the setting.
- Run `npm run build` before `npm test`: the `configDefaults` test reads the generated schema.

## Changing a setting

People's `settings.json` files depend on a setting's name, type, and meaning. A change must keep existing setups
working, so a setting is never renamed or removed in one step: the old one is deprecated first.

### Before you start

- Weigh the change against the [design principles](./design-principles.md).
- If a decision has more than one reasonable answer with lasting effects (a new name, a new shape, a default that
  changes what gets flagged), settle the design first. [ADRs](./ADRs/README.md) are a tool for that.
- Pick the commit type by what users notice. See [`CONTRIBUTING.md`](../CONTRIBUTING.md#commit-messages).

### Changing a default

1. Change `@default` in the doc comment, and the same value in `configDefaults.mts`.
2. Regenerate (`npm run build`, `npm run gen-docs`) and run the tests.
3. In the release note, say what changes for users and how to keep the old behavior: set the setting to the old value.

### Changing a type

Changing a type in place breaks the values people already have. Either:

- accept both the old and the new form, and handle both in the code, or
- add a setting with a new name and deprecate the old one, as in [Renaming a setting](#renaming-a-setting).

### Renaming a setting

1. Add the new setting, following [Adding a setting](#adding-a-setting).
2. Deprecate the old one, following [Deprecating a setting](#deprecating-a-setting).
3. Keep the old value working:
    - Read the old setting first, then let the new one override it. When both are set, the new one wins.
    - When the extension writes the setting, it writes only the new name.
    - See `packages/_server/src/config/extractEnabledFileTypes.mts` (`enabledLanguageIds` and `enableFiletypes` →
      `enabledFileTypes`) for an example.
4. Test the three cases: only the old name set, only the new name set, and both set.

### Deprecating a setting

1. Add `@deprecated true` and a `@deprecationMessage` to the doc comment:
    - with a replacement: ``@deprecationMessage - Use `#cSpell.newName#` instead.``
    - without one: say why, for example `@deprecationMessage No longer supported.`
2. Move it to the Legacy section: remove it from its section's list in `cspellConfig.mts`, and add it to
   `_VSConfigLegacy`.
3. Keep it in `ConfigFields` and `configDefaults`, and keep reading it.
4. Regenerate. The Settings UI shows the deprecation message, and the website lists the setting as deprecated.

Moving old values to the new setting is the job of a planned migration command. It will move deprecated settings to
their replacements, and the extension will offer to run it when it finds a deprecated setting. Until it exists, reading
the old setting as a fallback is what keeps old values working.

### Removing a setting

A setting can be removed only when both are true:

- it has been deprecated, and
- the migration offer has shipped, and at least one minor release has followed it.

Until the migration command exists, deprecated settings stay.

To remove one:

1. Delete the property from its interface, from `_VSConfigLegacy`, from `ConfigFields`, and from `configDefaults`.
2. Delete the code that read it as a fallback.
3. Regenerate and run the tests.
4. Use `fix!:` if a setup that still uses the old setting would break.

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
