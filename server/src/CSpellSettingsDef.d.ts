
/**
 * These settings come from user and workspace settings.
 */
interface CSpellPackageSettings {
    // languageIds for the files to spell check.
    enabledLanguageIds: string[];

    // matching file paths will to be ignored
    ignorePaths?: string[];

    // The maximum number of problems to report in a file.
    maxNumberOfProblems?: number;

    // Words to add to dictionary
    words?: string[];

    // Words to add to dictionary -- should only be in the user config file.
    userWords?: string[];

    // The minimum length of a word before checking it against a dictionary.
    minWordLength?: number;

    // Number of suggestions to make
    numSuggestions?: number;
}


interface CSpellUserSettings {
    // Version of the setting file.
    version: string;

    // current active spelling language
    language: string;

    // list of words to be always considered correct
    words: string[];

    // matching file paths will to be ignored
    ignorePaths?: string[];

    // list of words to always be considered incorrect.
    flagWords: string[];
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

    // comment at the end of the file
    '//$'?: string[];
}

