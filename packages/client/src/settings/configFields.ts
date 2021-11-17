import type { CSpellUserSettings } from '../client';

export type ConfigKeys = Exclude<keyof CSpellUserSettings, '$schema' | 'version' | 'id' | 'experimental.enableRegexpView'>;

type CSpellUserSettingsFields = {
    [key in ConfigKeys]: key;
};

export const ConfigFields: CSpellUserSettingsFields = {
    allowCompoundWords: 'allowCompoundWords',
    allowedSchemas: 'allowedSchemas',
    blockCheckingWhenAverageChunkSizeGreatherThan: 'blockCheckingWhenAverageChunkSizeGreatherThan',
    blockCheckingWhenLineLengthGreaterThan: 'blockCheckingWhenLineLengthGreaterThan',
    blockCheckingWhenTextChunkSizeGreaterThan: 'blockCheckingWhenTextChunkSizeGreaterThan',
    caseSensitive: 'caseSensitive',
    checkLimit: 'checkLimit',
    customDictionaries: 'customDictionaries',
    customFolderDictionaries: 'customFolderDictionaries',
    customUserDictionaries: 'customUserDictionaries',
    customWorkspaceDictionaries: 'customWorkspaceDictionaries',
    description: 'description',
    diagnosticLevel: 'diagnosticLevel',
    dictionaries: 'dictionaries',
    dictionaryDefinitions: 'dictionaryDefinitions',
    enabled: 'enabled',
    enabledLanguageIds: 'enabledLanguageIds',
    enableFiletypes: 'enableFiletypes',
    enableGlobDot: 'enableGlobDot',
    files: 'files',
    fixSpellingWithRenameProvider: 'fixSpellingWithRenameProvider',
    flagWords: 'flagWords',
    gitignoreRoot: 'gitignoreRoot',
    globRoot: 'globRoot',
    ignorePaths: 'ignorePaths',
    ignoreRegExpList: 'ignoreRegExpList',
    ignoreWords: 'ignoreWords',
    import: 'import',
    includeRegExpList: 'includeRegExpList',
    language: 'language',
    languageId: 'languageId',
    languageSettings: 'languageSettings',
    logLevel: 'logLevel',
    maxDuplicateProblems: 'maxDuplicateProblems',
    maxNumberOfProblems: 'maxNumberOfProblems',
    minWordLength: 'minWordLength',
    name: 'name',
    noConfigSearch: 'noConfigSearch',
    noSuggestDictionaries: 'noSuggestDictionaries',
    numSuggestions: 'numSuggestions',
    overrides: 'overrides',
    patterns: 'patterns',
    pnpFiles: 'pnpFiles',
    readonly: 'readonly',
    reporters: 'reporters',
    showCommandsInEditorContextMenu: 'showCommandsInEditorContextMenu',
    showStatus: 'showStatus',
    showStatusAlignment: 'showStatusAlignment',
    spellCheckDelayMs: 'spellCheckDelayMs',
    spellCheckOnlyWorkspaceFiles: 'spellCheckOnlyWorkspaceFiles',
    suggestionMenuType: 'suggestionMenuType',
    suggestionNumChanges: 'suggestionNumChanges',
    suggestionsTimeout: 'suggestionsTimeout',
    useGitignore: 'useGitignore',
    usePnP: 'usePnP',
    userWords: 'userWords',
    words: 'words',
    workspaceRootPath: 'workspaceRootPath',
};

// export const ConfigKeysNames = Object.values(ConfigKeysByField);
