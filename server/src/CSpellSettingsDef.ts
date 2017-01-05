
/**
 * These settings come from user and workspace settings.
 */
export interface CSpellPackageSettings extends CSpellUserSettings {
}


export interface CSpellUserSettings {
    // Version of the setting file.
    version?: string;

    // current active spelling language
    language?: string;

    // list of words to be always considered correct
    words?: string[];

    // list of words to be ignored
    ignoreWords?: string[];

    // matching file paths will to be ignored
    ignorePaths?: string[];

    // list of words to always be considered incorrect.
    flagWords?: string[];

    // Enabled
    enabled?: boolean;

    // Show status
    showStatus?: boolean;

    // Delay in ms after a document has changed before checking it for spelling errors.
    spellCheckDelayMs?: number;

    // languageIds for the files to spell check.
    enabledLanguageIds?: string[];

    // The maximum number of problems to report in a file.
    maxNumberOfProblems?: number;

    // Words to add to dictionary -- should only be in the user config file.
    userWords?: string[];

    // The minimum length of a word before checking it against a dictionary.
    minWordLength?: number;

    // Number of suggestions to make
    numSuggestions?: number;

    // List of patterns to exclude from spell checking
    ignoreRegExpList?: (string|RegExp)[];

    // List of patterns to define the text to be included for spell checking
    includeRegExpList?: (string|RegExp)[];

    // Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList
    patterns?: RegExpPatternDefinition[];

    // List of available dictionaries
    dictionaries?: DictionaryDefinition[];

    // Compound Word settings
    allowCompoundWords?: boolean;

    // Additional settings for individual languages.
    languageSettings?: LanguageSetting[];
}


export interface CSpellUserSettingsWithComments extends CSpellUserSettings {
    // comment at the beginning of the file
    '//^'?: string[];

    // Version of the setting file.
    '// version'?: string[];

    // current active spelling language
    '// language'?: string[];

    // list of words to be always considered correct
    '// words'?: string[];  // comment for

    // matching file paths will to be ignored
    '// ignorePaths'?: string[];

    // list of words to always be considered incorrect.
    '// flagWords'?: string[];

    // Enabled
    '// enabled'?: string[];

    // Show status
    '// showStatus'?: string[];

    // Delay after a document has changed before checking it for spelling errors.
    '// spellCheckDelayMs'?: string[];

    // languageIds for the files to spell check.
    '// enabledLanguageIds'?: string[];

    // The maximum number of problems to report in a file.
    '// maxNumberOfProblems'?: string[];

    // Words to add to dictionary -- should only be in the user config file.
    '// userWords'?: string[];

    // The minimum length of a word before checking it against a dictionary.
    '// minWordLength'?: string[];

    // Number of suggestions to make
    '// numSuggestions'?: string[];

    // List of patterns to exclude from spell checking
    '// ignoreRegExpList'?: string[];

    // Compound Word settings
    '// allowCompoundWords'?: string[];

    // comment at the end of the file
    '//$'?: string[];
}

export interface DictionaryDefinition {
    // The reference name of the dictionary, used with program language settings
    name: string;
    // Path to the file, if undefined the path to the extension dictionaries is assumed
    path?: string;
    // File name
    file: string;
    // Type of file:
    //  S - single word per line,
    //  W - each line can contain one or more word separated by space,
    //  C - each line is treated like code (Camel Case is allowed)
    // Default is C
    // C is the slowest to load due to the need to split each line based upon code splitting rules.
    type?: 'S'|'W'|'C';
}

export interface LanguageSetting {
    // The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages
    languageId: string;
    // True to enable compound word checking.
    allowCompoundWords?: boolean;
    // Optional list of dictionaries to use.
    dictionaries?: string[];
}


export interface RegExpPatternDefinition {
    name: string;
    pattern: string | RegExp;
}