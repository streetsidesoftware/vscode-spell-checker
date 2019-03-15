# vscode-spell-checker

[![Build Status](https://travis-ci.org/Jason-Rev/vscode-spell-checker.svg?branch=master)](https://travis-ci.org/Jason-Rev/vscode-spell-checker)
[![](https://vsmarketplacebadge.apphb.com/version-short/streetsidesoftware.code-spell-checker.svg)](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
[![](https://vsmarketplacebadge.apphb.com/installs-short/streetsidesoftware.code-spell-checker.svg)](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
[![](https://vsmarketplacebadge.apphb.com/rating-short/streetsidesoftware.code-spell-checker.svg)](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

A simple source code spell checker for multiple programming languages.

For the readme on the plugin: [README](./client/README.md).

## Contributions

## Building the extension

1. Build the server: `cd server && npm install && npm run build && cd ..`
1. Build the client: `cd client && npm install && npm run build && cd ..`
1. Launch vscode: `code client`
1. Run the extension from vscode: `F5`

### Debugging the Client

1. Launch vscode: `code client`
1. Run the extension from vscode: `F5`

### Debugging the Server

1. Launch vscode for the server: `code server`
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

## Dictionaries / Word List

Improvements to existing word lists and new word lists are welcome.

All dictionaries are being migrated to [cspell-dicts](https://github.com/Jason3S/cspell-dicts).
Some dictionaries are still located at [cspell](https://github.com/Jason3S/cspell)/dictionaries.

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

cSpell currently has English locals: `en-US` and `en-GB`.

Example words differences: behaviour (en-GB) vs behavior (en-US)

<!---
    cSpell:ignore newyork
    cSpell:words behaviour behavior
-->
