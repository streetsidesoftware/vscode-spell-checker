import type { CSpellUserSettings } from '../client/server';

export type ConfigKeys = Exclude<keyof CSpellUserSettings, '$schema' | 'version' | 'id' | 'experimental.enableRegexpView'>;

type CSpellUserSettingsFields = {
    [key in ConfigKeys]: key;
};

export const ConfigKeysByField: CSpellUserSettingsFields = {
    allowCompoundWords: 'allowCompoundWords',
    allowedSchemas: 'allowedSchemas',
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
    files: 'files',
    fixSpellingWithRenameProvider: 'fixSpellingWithRenameProvider',
    flagWords: 'flagWords',
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
    showCommandsInEditorContextMenu: 'showCommandsInEditorContextMenu',
    showStatus: 'showStatus',
    showStatusAlignment: 'showStatusAlignment',
    spellCheckDelayMs: 'spellCheckDelayMs',
    spellCheckOnlyWorkspaceFiles: 'spellCheckOnlyWorkspaceFiles',
    usePnP: 'usePnP',
    userWords: 'userWords',
    words: 'words',
    workspaceRootPath: 'workspaceRootPath',
};

// export const ConfigKeysNames = Object.values(ConfigKeysByField);
