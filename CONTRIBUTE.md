# vscode-spell-checker

[![](https://vsmarketplacebadge.apphb.com/installs-short/streetsidesoftware.code-spell-checker.svg)](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
[![](https://vsmarketplacebadge.apphb.com/rating-short/streetsidesoftware.code-spell-checker.svg)](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
[![](https://vsmarketplacebadge.apphb.com/version-short/streetsidesoftware.code-spell-checker.svg)](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

[![Build & Test Actions Status](https://github.com/streetsidesoftware/vscode-spell-checker/workflows/build-test/badge.svg)](https://github.com/streetsidesoftware/vscode-spell-checker/actions)
[![Integration Tests Actions Status](https://github.com/streetsidesoftware/vscode-spell-checker/workflows/Integration%20Tests/badge.svg)](https://github.com/streetsidesoftware/vscode-spell-checker/actions)
[![Lint Actions Status](https://github.com/streetsidesoftware/vscode-spell-checker/workflows/lint/badge.svg)](https://github.com/streetsidesoftware/vscode-spell-checker/actions)

A simple source code spell checker for multiple programming languages.

For the readme on the plugin: [README](./packages/client/README.md).

## Contributions

## Building the extension

1. `yarn install`
1. Launch vscode: `code Spell Checker.code-workspace`
1. Run the extension from vscode:
    1. `Debug Tab`
    1. Choose `Launch Extension` configuration.
    1. `F5`

<sup>\*</sup> Requires Node >= 14

### Debugging the Client

1. Launch vscode: `code packages/client`
1. Run the extension from vscode: `F5`

### Debugging the Server

1. Launch vscode for the server: `code packages/_server`
1. Launch the client as specified above.
1. Attach to the server: `F5` or `Debug -> Attach Server`

Sometimes the ports get stuck. You can see if they are being used with:

```bash
netstat -anp tcp | grep 60048
```

Use the following command to find the process id (PID):

```bash
lsof -i tcp:60048
```

If anything shows up, then the port is still locked.

## Packages

-   `client` - the actual extension running in VS Code.
-   `_server` - the extension server that processes spell checker requests
-   `_settingsViewer` - a webapp that provides a visual interface to the configuration files.
-   `_integrationTests` - a test suite that launches the extension in VS Code.

## Adding configurations

1. Edit `SpellCheckerSettings` in [server/src/config/cspellConfig.ts](./packages/_server/src/config/cspellConfig.ts) to add your configuration field, e.g.
    ```typescript
    /**
      * @scope resource
      * @description Configuration description.
      * @default "option2"
      * @enumDescriptions [
      *  "Option 1 Description",
      *  "Option 2 Description"]
      */
     myEnumConfig?: 'option1' | 'option2';
    ```
1. Edit [client/src/settings/configFields.ts](./packages/client/src/settings/configFields.ts) by adding a new entry to `ConfigFields`:
    ```typescript
    export const ConfigFields: CSpellUserSettingsFields = {
        ...
        myEnumConfig: 'myEnumConfig'
    }
    ```
1. Run
    ```bash
    yarn run build-package-schema
    yarn workspace server run build
    ```
    It'll update the [package.json](./package.json) with the new configurations.
1. Use the configurations with:
    ```typescript
    const yourConfigValue = getSettingFromVSConfig(ConfigFields.myEnumConfig, document);
    ```

## Dictionaries / Word List

Improvements to existing word lists and new word lists are welcome.

All dictionaries are being migrated to [cspell-dicts](https://github.com/Jason3S/cspell-dicts).
Some dictionaries are still located at [cspell](https://github.com/Jason3S/cspell)/[dictionaries](https://github.com/streetsidesoftware/cspell/tree/master/packages/cspell-lib/dictionaries).

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

The word list complier will convert camelCase and snake_case words into a simple word list.
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

### Locals

The default language is English: `"cSpell.language": "en"`

CSpell currently has English locals: `en-US` and `en-GB`.

Example words differences: behaviour (en-GB) vs behavior (en-US)

<!---
    cSpell:ignore newyork lsof netstat
    cSpell:words behaviour behavior
-->
