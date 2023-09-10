import type { FsPath } from '@cspell/cspell-types';

/**
 * @title Named dictionary to be enabled / disabled
 * - `true` - turn on the named dictionary
 * - `false` - turn off the named dictionary
 */
export type EnableCustomDictionary = boolean;

/**
 * Enable / Disable checking file types (languageIds).
 * To disable a language, prefix with `!` as in `!json`,
 *
 *
 * Example:
 * ```
 * jsonc       // enable checking for jsonc
 * !json       // disable checking for json
 * kotlin      // enable checking for kotlin
 * ```
 * @pattern (^!*(?!\s)[\s\w_.\-]+$)|(^!*[*]$)
 * @patternErrorMessage "Allowed characters are `a-zA-Z`, `.`, `-`, `_` and space."
 */
export type EnableFileTypeId = string;

/**
 * A string representation of a Regular Expression.
 */
export type RegExpString = string;

/**
 * @hidden
 */
export type HiddenFsPath = FsPath;
