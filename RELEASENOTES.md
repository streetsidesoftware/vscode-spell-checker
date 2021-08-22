# Version 2.0 Preview

This is a Preview release of the Extension.

Work is still underway for the final release to the VS Code Marketplace.

## Highlights

-   By default, only files in a workspace are spell checked.
-   Be able to specify which files to check by adding globs to `files` setting.
-   Spelling suggestions available from the context menu.
-   Improved context menu options.
-   Upgrades [cspell](https://www.npmjs.com/package/cspell) to version 5.7.1.
-   Supports case sensitive dictionaries
-   Full support of Yaml configuration files: `cspell.config.yaml`
-   Full support of configuration in `package.json` under `cspell` section.
-   Partial support of JavaScript configuration files: `cspell.config.js`
    The extension supports reading the configuration but can only write to `.json` and `.yaml` files.
-   Supports dictionary entries that have numbers and mixed case.
-   Supports more word splitting formats
    It correctly splits both `ERRORcode` and `ERRORCode`
-   Reduced installation size and faster loading

## Manual Installation

-   Download and decompress `code-spell-checker.zip`
-   From VS Code Install from VSIX `code-spell-checker-2.0.1-alpha.16.vsix`
    ![image](https://user-images.githubusercontent.com/3740137/120071300-f0a27600-c08e-11eb-9828-155be0405510.png)

# Features

## Turning on case sensitive spell checking

**VS Code UI**

![image](https://user-images.githubusercontent.com/3740137/129460586-498f1bf4-3b53-43d6-b525-7ad283b8e8bf.png)

**VS Code `settings.json`**

```jsonc
"cSpell.caseSensitive": true
```

**`cspell.json`**

```jsonc
"caseSensitive": true
```

**For a file type: `markdown`**
`cspell.json`

```jsonc
"languageSettings": [
    { "languageId": "markdown", "caseSensitive": true }
]
```

**For a file extension: `*.md`**
`cspell.json`

```jsonc
"overrides": [
    { "filename": "*.md", "caseSensitive": true }
]
```

## Making Words Forbidden

There are several ways to mark a word as forbidden:

1. In a custom word list with words beginning with `!`.
    ```
    !forbiddenWord
    ```
2. In `words` section of `cspell` configuration:
    ```
    "words": [
        "!forbiddenWord",
        "configstore"
    ],
    ```
3. In `flagWords` section of `cspell` configuration:
    ```
    "flagWords": ["forbiddenWord"]
    ```

## Overriding Forbidden words

Sometimes it is necessary to allow a word even if it is forbidden.

### In a comment

```js
/**
 * Do not mark `forbiddenWord` as incorrect.
 * cspell:ignore forbiddenWord
 */
```

### In the `cspell` configuration

```jsonc
{
    "ignoreWords": ["forbiddenWord"]
}
```
