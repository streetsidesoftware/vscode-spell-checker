
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

    // comment at the end of the file
    '//$'?: string[];
}

