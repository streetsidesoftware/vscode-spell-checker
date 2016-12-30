
/**
 * These settings come from user and workspace settings.
 */
interface CSpellPackageSettings extends CSpellUserSettings {
}


interface CSpellUserSettings {
    // Version of the setting file.
    version?: string;

    // current active spelling language
    language?: string;

    // list of words to be always considered correct
    words?: string[];

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
    ignoreRegExpList?: string[];

    // Compound Word settings
    compoundWords?: CompoundWordSettings;
}


interface CSpellUserSettingsWithComments extends CSpellUserSettings {
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
    '// compoundWords'?: string[];

    // comment at the end of the file
    '//$'?: string[];
}

type CompoundWordSettings = boolean;

interface DictionaryFileDescriptor {
    // The reference name of the dictionary, used with program language settings
    name: string;
    // Path to the file, if undefined the path to the extension dictionaries is assumed
    path?: string;
    // File name
    file: string;
    // Default is C for code words. S - single word per line, W - each line can contain one or more word separated by space, C - each line is treated like code (Camel Case is allowed)
    // C is the slowest to load due to the need to split each line based upon code splitting rules.
    type?: 'S'|'W'|'C';
}

interface LanguageSetting {
    // The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages
    languageId: string;
    // True to enable compound word checking.
    allowCompoundWords?: boolean;
    // Optional list of dictionaries to use.
    dictionaries?: string[];
}

// LanguageSettings are a collection of LanguageSetting.  They are applied in order, matching against the languageId.
// Dictionaries are concatenated together.
type LanguageSettings = LanguageSetting[];