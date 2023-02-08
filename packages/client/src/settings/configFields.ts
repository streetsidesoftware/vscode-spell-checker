import type { CSpellUserSettings } from '../client';
import { ConfigFields as CSpellConfigFields } from '@cspell/cspell-types';

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
    autoFormatConfigFile: 'autoFormatConfigFile',
    allowedSchemas: 'allowedSchemas',
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
    fixSpellingWithRenameProvider: 'fixSpellingWithRenameProvider',
    hideAddToDictionaryCodeActions: 'hideAddToDictionaryCodeActions',
    logLevel: 'logLevel',
    logFile: 'logFile',
    mapOfEnabledFileTypes: 'mapOfEnabledFileTypes',
    maxDuplicateProblems: 'maxDuplicateProblems',
    maxNumberOfProblems: 'maxNumberOfProblems',
    noSuggestDictionaries: 'noSuggestDictionaries',
    showAutocompleteSuggestions: 'showAutocompleteSuggestions',
    showCommandsInEditorContextMenu: 'showCommandsInEditorContextMenu',
    showStatus: 'showStatus',
    showStatusAlignment: 'showStatusAlignment',
    showSuggestionsLinkInEditorContextMenu: 'showSuggestionsLinkInEditorContextMenu',
    spellCheckDelayMs: 'spellCheckDelayMs',
    spellCheckOnlyWorkspaceFiles: 'spellCheckOnlyWorkspaceFiles',
    suggestionMenuType: 'suggestionMenuType',
    suggestionNumChanges: 'suggestionNumChanges',
    suggestionsTimeout: 'suggestionsTimeout',
    workspaceRootPath: 'workspaceRootPath',
};

// export const ConfigKeysNames = Object.values(ConfigKeysByField);
