export interface CSpellSettings {
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
}