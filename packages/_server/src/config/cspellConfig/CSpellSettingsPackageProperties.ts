import type { CSpellSettings, FsPath, GlobDef, SimpleGlob } from '@cspell/cspell-types';
import type { HiddenFsPath } from './annotatedTypes';

/**
 * CSpellSettingsPackageProperties are used to annotate CSpellSettings found in
 * the `package.json#contributes.configuration`
 */
export interface CSpellSettingsPackageProperties extends CSpellSettings {
    /**
     * Enable / Disable the spell checker.
     * @scope resource
     * @default true
     */
    enabled?: boolean;

    /**
     * @scope resource
     * @description
     * Current active spelling language.
     * Example: "en-GB" for British English
     * Example: "en,nl" to enable both English and Dutch
     * @default "en"
     */
    language?: string;

    /**
     * @scope resource
     * @description
     * Controls the maximum number of spelling errors per document.
     * @default 100
     */
    maxNumberOfProblems?: number;

    /**
     * @scope resource
     * @description
     * Controls the number of suggestions shown.
     * @default 8
     */
    numSuggestions?: number;

    /**
     * @scope resource
     * @default 3
     */
    suggestionNumChanges?: CSpellSettings['suggestionNumChanges'];

    /**
     * @scope resource
     * @default 400
     */
    suggestionsTimeout?: CSpellSettings['suggestionsTimeout'];

    /**
     * @scope resource
     * @default 4
     */
    minWordLength?: number;

    /**
     * @scope resource
     * @default 5
     */
    maxDuplicateProblems?: number;

    /**
     * @title Enabled Language Ids
     * @scope resource
     * @description
     * @markdownDescription
     * Specify a list of file types to spell check. It is better to use `#cSpell.enableFiletypes#` to Enable / Disable checking files types.
     * @uniqueItems true
     * @default [
     *      "asciidoc",
     *      "c",
     *      "cpp",
     *      "csharp",
     *      "css",
     *      "elixir",
     *      "erlang",
     *      "git-commit",
     *      "go",
     *      "graphql",
     *      "handlebars",
     *      "haskell",
     *      "html",
     *      "jade",
     *      "java",
     *      "javascript",
     *      "javascriptreact",
     *      "json",
     *      "jsonc",
     *      "jupyter",
     *      "latex",
     *      "less",
     *      "markdown",
     *      "php",
     *      "plaintext",
     *      "python",
     *      "pug",
     *      "restructuredtext",
     *      "rust",
     *      "scala",
     *      "scss",
     *      "scminput",
     *      "swift",
     *      "text",
     *      "typescript",
     *      "typescriptreact",
     *      "vue",
     *      "yaml",
     *      "yml"
     *  ]
     */
    enabledLanguageIds?: string[];

    /**
     * @description
     * @markdownDescription
     * Allows this configuration to inherit configuration for one or more other files.
     *
     * See [Importing / Extending Configuration](https://cspell.org/configuration/imports/) for more details.
     * @scope resource
     */
    import?: FsPath[] | HiddenFsPath;

    /**
     * @scope resource
     */
    words?: string[];

    /**
     * @scope resource
     */
    userWords?: string[];

    /**
     * A list of words to be ignored by the spell checker.
     * @scope resource
     */
    ignoreWords?: string[];

    /**
     * @markdownDescription
     * Glob patterns of files to be ignored. The patterns are relative to the `#cSpell.globRoot#` of the configuration file that defines them.
     * @title Glob patterns of files to be ignored
     * @scope resource
     * @default [
     *      "package-lock.json",
     *      "node_modules",
     *      "vscode-extension",
     *      ".git/objects",
     *      ".vscode",
     *      ".vscode-insiders"
     *    ]
     */
    ignorePaths?: (SimpleGlob | GlobDefX)[];

    /**
     * @description
     * @markdownDescription
     * The root to use for glop patterns found in this configuration.
     * Default: The current workspace folder.
     * Use `globRoot` to define a different location. `globRoot` can be relative to the location of this configuration file.
     * Defining globRoot, does not impact imported configurations.
     *
     * Special Values:
     *
     * - `${workspaceFolder}` - Default - globs will be relative to the current workspace folder\n
     * - `${workspaceFolder:<name>}` - Where `<name>` is the name of the workspace folder.
     *
     * @scope resource
     */
    globRoot?: CSpellSettings['globRoot'];

    /**
     * @description
     * @markdownDescription
     * Glob patterns of files to be checked.
     * Glob patterns are relative to the `#cSpell.globRoot#` of the configuration file that defines them.
     * @scope resource
     */
    files?: CSpellSettings['files'];

    /**
     * @scope resource
     */
    flagWords?: string[];

    /**
     * @description
     * @markdownDescription
     * Defines a list of patterns that can be used with the `#cSpell.ignoreRegExpList#` and
     * `#cSpell.includeRegExpList#` options.
     *
     * **Example:**
     *
     * ```jsonc
     * "cSpell.patterns": [
     *   {
     *     "name": "comment-single-line",
     *     "pattern": "/#.*​/g"
     *   },
     *   {
     *     "name": "comment-multi-line",
     *     "pattern": "/(?:\\/\\*[\\s\\S]*?\\*\\/)/g"
     *   }
     * ]
     * ```
     *
     * @scope resource
     */
    patterns?: CSpellSettings['patterns'];

    /**
     * @description
     * @markdownDescription
     * List of regular expression patterns or defined pattern names to match for spell checking.
     *
     * If this property is defined, only text matching the included patterns will be checked.
     *
     * @scope resource
     */
    includeRegExpList?: CSpellSettings['includeRegExpList'];

    // cspell:ignore mapsto venv
    /**
     * @scope resource
     * @description
     * @markdownDescription
     * List of regular expressions or Pattern names (defined in `#cSpell.patterns#`) to exclude from spell checking.
     *
     * - When using the VS Code Preferences UI, it is not necessary to escape the `\`, VS Code takes care of that.
     * - When editing the VS Code `settings.json` file,
     *   it is necessary to escape `\`.
     *   Each `\` becomes `\\`.
     *
     * The default regular expression flags are `gi`. Add `u` (`gui`), to enable Unicode.
     *
     * | VS Code UI          | JSON                  | Description                                  |
     * | :------------------ | :-------------------- | :------------------------------------------- |
     * | `/\\[a-z]+/gi`      | `/\\\\[a-z]+/gi`      | Exclude LaTeX command like `\mapsto`         |
     * | `/\b[A-Z]{3,5}\b/g` | `/\\b[A-Z]{3,5}\\b/g` | Exclude full-caps acronyms of 3-5 length.    |
     * | `CStyleComment`     | `CStyleComment`       | A built in pattern                           |
     */
    ignoreRegExpList?: CSpellSettings['ignoreRegExpList'];

    /**
     * @scope resource
     * @default false
     * @description
     * @markdownDescription
     * Enable / Disable allowing word compounds.
     * - `true` means `arraylength` would be ok
     * - `false` means it would not pass.
     *
     * Note: this can also cause many misspelled words to seem correct.
     */
    allowCompoundWords?: CSpellSettings['allowCompoundWords'];

    /**
     * @scope resource
     */
    languageSettings?: CSpellSettings['languageSettings'];

    /**
     * @scope resource
     * @description
     * @markdownDescription
     * Optional list of dictionaries to use.
     * Each entry should match the name of the dictionary.
     * To remove a dictionary from the list add `!` before the name.
     * i.e. `!typescript` will turn off the dictionary with the name `typescript`.
     */
    dictionaries?: CSpellSettings['dictionaries'];

    /**
     * @description
     * @markdownDescription
     * Define additional available dictionaries.
     *
     * For example, you can use the following to add a custom dictionary:
     *
     * ```json
     * "cSpell.dictionaryDefinitions": [
     *   { "name": "custom-words", "path": "./custom-words.txt"}
     * ],
     * "cSpell.dictionaries": ["custom-words"]
     * ```
     * @scope resource
     */
    dictionaryDefinitions?: CSpellSettings['dictionaryDefinitions'];

    /**
     * @scope resource
     * @description
     * @markdownDescription
     * Determines if words must match case and accent rules.
     *
     * - `false` - Case is ignored and accents can be missing on the entire word.
     *   Incorrect accents or partially missing accents will be marked as incorrect.
     *   Note: Some languages like Portuguese have case sensitivity turned on by default.
     *   You must use `#cSpell.languageSettings#` to turn it off.
     * - `true` - Case and accents are enforced by default.
     */
    caseSensitive?: CSpellSettings['caseSensitive'];

    /**
     * @hidden
     */
    languageId?: CSpellSettings['languageId'];

    /**
     * @scope resource
     */
    noConfigSearch?: CSpellSettings['noConfigSearch'];

    /**
     * @scope resource
     * @default true
     */
    useGitignore?: CSpellSettings['useGitignore'];

    /**
     * Hide this for now.
     * Need to resolve the roots and support substitution of workspace paths.
     * @hidden
     */
    gitignoreRoot?: CSpellSettings['gitignoreRoot'];

    /**
     * @hidden
     */
    pnpFiles?: CSpellSettings['pnpFiles'];

    /**
     * @scope resource
     */
    usePnP?: CSpellSettings['usePnP'];

    /**
     * @hidden
     */
    readonly?: CSpellSettings['readonly'];

    /**
     * @scope resource
     */
    noSuggestDictionaries?: CSpellSettings['noSuggestDictionaries'];

    /**
     * @scope window
     */
    validateDirectives?: CSpellSettings['validateDirectives'];
}

/**
 * @hidden
 */
type GlobDefX = GlobDef;
