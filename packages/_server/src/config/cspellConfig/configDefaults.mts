import type { AllSpellCheckerSettingsInVSCode } from './cspellConfig.mjs';

type ConfigFieldsWithDefaults =
    | 'advanced.feature.useReferenceProviderWithRename'
    | 'allowCompoundWords'
    | 'allowWordsToBeAddTo'
    | 'autocorrect'
    | 'autoFormatConfigFile'
    | 'blockCheckingWhenAverageChunkSizeGreaterThan'
    | 'blockCheckingWhenLineLengthGreaterThan'
    | 'blockCheckingWhenTextChunkSizeGreaterThan'
    | 'checkLimit'
    | 'checkOnlyEnabledFileTypes'
    | 'checkVSCodeSystemFiles'
    | 'diagnosticLevel'
    | 'doNotUseCustomDecorationForScheme'
    | 'enabled'
    | 'enabledFileTypes'
    | 'enabledNotifications'
    | 'enabledSchemes'
    | 'experimental.enableRegexpView'
    | 'experimental.symbols'
    | 'fixSpellingWithRenameProvider'
    | 'hideAddToDictionaryCodeActions'
    | 'hideIssuesWhileTyping'
    | 'ignorePaths'
    | 'ignoreRandomStrings'
    | 'language'
    | 'logLevel'
    | 'maxDuplicateProblems'
    | 'maxNumberOfProblems'
    | 'menuItemsOnCSpellConfigMenu'
    | 'menuItemsOnEditorContextMenu'
    | 'menuItemsOnSpellCheckerActionMenu'
    | 'menuItemsOnSpellingContextMenu'
    | 'mergeCSpellSettings'
    | 'mergeCSpellSettingsFields'
    | 'minRandomLength'
    | 'minWordLength'
    | 'numSuggestions'
    | 'overviewRulerColor'
    | 'revealIssuesAfterDelayMS'
    | 'showAutocompleteDirectiveSuggestions'
    | 'showCommandsInEditorContextMenu'
    | 'showInRuler'
    | 'showStatus'
    | 'showStatusAlignment'
    | 'showSuggestionsLinkInEditorContextMenu'
    | 'spellCheckDelayMs'
    | 'spellCheckOnlyWorkspaceFiles'
    | 'suggestionMenuType'
    | 'suggestionNumChanges'
    | 'suggestionsTimeout'
    | 'textDecorationColor'
    | 'textDecorationColorFlagged'
    | 'textDecorationColorSuggestion'
    | 'textDecorationLine'
    | 'textDecorationStyle'
    | 'textDecorationThickness'
    | 'trustedWorkspace'
    | 'useCustomDecorations'
    | 'useGitignore'
    | 'useLocallyInstalledCSpellDictionaries';

export const configDefaults: Pick<Required<AllSpellCheckerSettingsInVSCode>, ConfigFieldsWithDefaults> = {
    'advanced.feature.useReferenceProviderWithRename': false,
    fixSpellingWithRenameProvider: true,
    logLevel: 'Error',
    trustedWorkspace: true,
    doNotUseCustomDecorationForScheme: {
        chatSessionInput: true,
        comment: true,
        'vscode-scm': true,
    },
    overviewRulerColor: '#348feb80',
    showInRuler: true,
    textDecorationColor: '#348feb',
    textDecorationColorFlagged: '#f44',
    textDecorationColorSuggestion: '#cf88',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationThickness: 'auto',
    useCustomDecorations: false,
    ignoreRandomStrings: true,
    minRandomLength: 40,
    'experimental.enableRegexpView': false,
    'experimental.symbols': false,
    checkOnlyEnabledFileTypes: true,
    checkVSCodeSystemFiles: false,
    enabledFileTypes: {
        '*': true,
        markdown: true,
    },
    enabledSchemes: {
        chatSessionInput: true,
        comment: true,
        file: true,
        gist: true,
        repo: true,
        sftp: true,
        untitled: true,
        'vscode-notebook-cell': true,
        'vscode-scm': true,
        'vscode-userdata': true,
        'vscode-vfs': true,
        vsls: true,
    },
    ignorePaths: [
        'package-lock.json',
        'node_modules',
        'vscode-extension',
        '.git/{info,lfs,logs,refs,objects}/**',
        '.git/{index,*refs,*HEAD}',
        '.vscode',
        '.vscode-insiders',
    ],
    mergeCSpellSettings: true,
    mergeCSpellSettingsFields: {
        allowCompoundWords: true,
        caseSensitive: true,
        dictionaries: true,
        dictionaryDefinitions: true,
        enableGlobDot: true,
        features: true,
        files: true,
        flagWords: true,
        gitignoreRoot: true,
        globRoot: true,
        ignorePaths: true,
        ignoreRegExpList: true,
        ignoreWords: true,
        import: true,
        includeRegExpList: true,
        language: true,
        languageId: true,
        languageSettings: true,
        loadDefaultConfiguration: true,
        minWordLength: true,
        noConfigSearch: true,
        noSuggestDictionaries: true,
        numSuggestions: true,
        overrides: true,
        patterns: true,
        pnpFiles: true,
        reporters: true,
        suggestWords: true,
        useGitignore: true,
        usePnP: true,
        userWords: true,
        validateDirectives: true,
        words: true,
    },
    spellCheckOnlyWorkspaceFiles: false,
    useGitignore: true,
    language: 'en',
    useLocallyInstalledCSpellDictionaries: true,
    allowCompoundWords: false,
    showStatus: true,
    showStatusAlignment: 'Right',
    allowWordsToBeAddTo: {
        cspell: true,
        dictionaries: true,
        folder: true,
        user: true,
        workspace: true,
    },
    hideAddToDictionaryCodeActions: false,
    menuItemsOnCSpellConfigMenu: {
        createCSpellConfig: true,
        createCustomDictionary: true,
    },
    menuItemsOnEditorContextMenu: {
        hideIssues: true,
        showIssues: true,
        spellingContextMenu: true,
        suggestSpellingCorrections: true,
    },
    menuItemsOnSpellCheckerActionMenu: {
        allowDocumentScheme: true,
        createCSpellConfig: true,
        disableFileType: true,
        editKeyboardShortcuts: true,
        editSpellCheckerSettings: true,
        enableFileType: true,
        excludeDocumentScheme: true,
        hideIssues: true,
        openConfigFiles: true,
        openFileInfoView: true,
        openIssuesPanel: true,
        openSpellCheckerConsole: true,
        showIssues: true,
    },
    menuItemsOnSpellingContextMenu: {
        addIgnoreWord: true,
        addIssuesToDictionary: true,
        addWordToCSpellConfig: true,
        addWordToDictionary: true,
        addWordToFolderDictionary: true,
        addWordToFolderSettings: true,
        addWordToUserDictionary: true,
        addWordToUserSettings: true,
        addWordToWorkspaceDictionary: true,
        addWordToWorkspaceSettings: true,
        suggestSpellingCorrections: true,
    },
    showCommandsInEditorContextMenu: true,
    showSuggestionsLinkInEditorContextMenu: true,
    suggestionMenuType: 'quickPick',
    blockCheckingWhenAverageChunkSizeGreaterThan: 200,
    blockCheckingWhenLineLengthGreaterThan: 20000,
    blockCheckingWhenTextChunkSizeGreaterThan: 1000,
    checkLimit: 500,
    spellCheckDelayMs: 50,
    suggestionsTimeout: 400,
    autoFormatConfigFile: false,
    autocorrect: false,
    diagnosticLevel: 'Information',
    enabledNotifications: {
        'Average Word Length too Long': true,
        'Lines too Long': true,
        'Maximum Word Length Exceeded': true,
    },
    hideIssuesWhileTyping: 'Word',
    maxDuplicateProblems: 20,
    maxNumberOfProblems: 100,
    minWordLength: 4,
    numSuggestions: 8,
    revealIssuesAfterDelayMS: 1500,
    showAutocompleteDirectiveSuggestions: true,
    suggestionNumChanges: 3,
    enabled: true,
} satisfies AllSpellCheckerSettingsInVSCode;
