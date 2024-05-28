import { ConfigFields as CSpellConfigFields } from '@cspell/cspell-types';

import type { CSpellUserSettings } from './cspellConfig.mjs';

export { ConfigFields as CSpellConfigFields } from '@cspell/cspell-types';

export type ConfigKeys = Exclude<
    keyof CSpellUserSettings,
    '$schema' | 'version' | 'id' | 'experimental.enableRegexpView' | 'experimental.enableSettingsViewerV2'
>;

type CSpellUserSettingsFields = {
    [key in ConfigKeys]: key;
};

export const ConfigFields: CSpellUserSettingsFields = {
    ...CSpellConfigFields,
    'advanced.feature.useReferenceProviderRemove': 'advanced.feature.useReferenceProviderRemove',
    'advanced.feature.useReferenceProviderWithRename': 'advanced.feature.useReferenceProviderWithRename',
    'experimental.symbols': 'experimental.symbols',
    autoFormatConfigFile: 'autoFormatConfigFile',
    blockCheckingWhenAverageChunkSizeGreaterThan: 'blockCheckingWhenAverageChunkSizeGreaterThan',
    blockCheckingWhenLineLengthGreaterThan: 'blockCheckingWhenLineLengthGreaterThan',
    blockCheckingWhenTextChunkSizeGreaterThan: 'blockCheckingWhenTextChunkSizeGreaterThan',
    checkLimit: 'checkLimit',
    checkOnlyEnabledFileTypes: 'checkOnlyEnabledFileTypes',
    customDictionaries: 'customDictionaries',
    customFolderDictionaries: 'customFolderDictionaries',
    customUserDictionaries: 'customUserDictionaries',
    customWorkspaceDictionaries: 'customWorkspaceDictionaries',
    diagnosticLevel: 'diagnosticLevel',
    diagnosticLevelFlaggedWords: 'diagnosticLevelFlaggedWords',
    fixSpellingWithRenameProvider: 'fixSpellingWithRenameProvider',
    hideAddToDictionaryCodeActions: 'hideAddToDictionaryCodeActions',
    languageStatusFields: 'languageStatusFields',
    logLevel: 'logLevel',
    logFile: 'logFile',
    maxDuplicateProblems: 'maxDuplicateProblems',
    maxNumberOfProblems: 'maxNumberOfProblems',
    mergeCSpellSettings: 'mergeCSpellSettings',
    mergeCSpellSettingsFields: 'mergeCSpellSettingsFields',
    noSuggestDictionaries: 'noSuggestDictionaries',
    showAutocompleteDirectiveSuggestions: 'showAutocompleteDirectiveSuggestions',
    showCommandsInEditorContextMenu: 'showCommandsInEditorContextMenu',
    showStatus: 'showStatus',
    showStatusAlignment: 'showStatusAlignment',
    showSuggestionsLinkInEditorContextMenu: 'showSuggestionsLinkInEditorContextMenu',
    spellCheckDelayMs: 'spellCheckDelayMs',
    spellCheckOnlyWorkspaceFiles: 'spellCheckOnlyWorkspaceFiles',
    suggestionMenuType: 'suggestionMenuType',
    suggestionNumChanges: 'suggestionNumChanges',
    suggestionsTimeout: 'suggestionsTimeout',
    useLocallyInstalledCSpellDictionaries: 'useLocallyInstalledCSpellDictionaries',
    workspaceRootPath: 'workspaceRootPath',
    trustedWorkspace: 'trustedWorkspace',
    // File Types and Schemes
    allowedSchemas: 'allowedSchemas',
    enabledFileTypes: 'enabledFileTypes',
    enabledLanguageIds: 'enabledLanguageIds',
    enabledSchemes: 'enabledSchemes',
    // Behavior
    hideIssuesWhileTyping: 'hideIssuesWhileTyping',
    revealIssuesAfterDelayMS: 'revealIssuesAfterDelayMS',
    // Appearance
    useCustomDecorations: 'useCustomDecorations',
    doNotUseCustomDecorationForScheme: 'doNotUseCustomDecorationForScheme',
    textDecoration: 'textDecoration',
    textDecorationLine: 'textDecorationLine',
    textDecorationStyle: 'textDecorationStyle',
    textDecorationThickness: 'textDecorationThickness',
    textDecorationColor: 'textDecorationColor',
    textDecorationColorFlagged: 'textDecorationColorFlagged',
    textDecorationColorSuggestion: 'textDecorationColorSuggestion',
    overviewRulerColor: 'overviewRulerColor',
    dark: 'dark',
    light: 'light',
} as const;

// export const ConfigKeysNames = Object.values(ConfigKeysByField);
