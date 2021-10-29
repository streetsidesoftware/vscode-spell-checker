import { ConfigFile, DictionaryEntry, Settings } from '../../api/settings';
import { uniqueFilter } from '../../api/utils';
import { sampleWorkspace, sampleWorkspaceSingleFolder } from './sampleWorkspace';

const languageIdsA = [
    'asciidoc',
    'c',
    'cpp',
    'csharp',
    'css',
    'go',
    'handlebars',
    'html',
    'jade',
    'javascript',
    'javascriptreact',
    'json',
    'latex',
    'less',
    'literate haskell',
    'markdown',
    'php',
    'plaintext',
    'pub',
    'python',
    'restructuredtext',
    'rust',
    'scss',
    'text',
    'typescript',
    'typescriptreact',
    'yml',
];
const languageIdsB = languageIdsA.concat(['cfml', 'java', 'scala', 'yaml']);
const languageIdsUser = languageIdsB;
const languageIdsWorkspace = languageIdsA;
const knownLanguageIds = languageIdsA.concat(languageIdsB).concat(['jsonc', 'perl', 'sh', 'bash', 'avro']).filter(uniqueFilter()).sort();

const dictionaries: DictionaryEntry[] = [
    { name: 'companies', locales: [], languageIds: [], description: 'Company names dictionary for cspell.' },
    { name: 'css', locales: [], languageIds: ['javascriptreact', 'typescriptreact', 'html', 'pug', 'jade', 'handlebars', 'php', 'css', 'less', 'scss'], description: 'CSS Keywords.' },
    { name: 'csharp', locales: [], languageIds: ['csharp'], description: 'C# Keywords and common library functions.' },
    { name: 'dotnet', locales: [], languageIds: ['csharp'], description: '.Net keywords.' },
    { name: 'filetypes', locales: [], languageIds: [], description: 'List of file types.' },
    { name: 'fonts', locales: [], languageIds: ['javascriptreact', 'typescriptreact', 'html', 'pug', 'jade', 'handlebars', 'php', 'css', 'less', 'scss'], description: 'List of fonts.' },
    { name: 'html', locales: [], languageIds: ['javascriptreact', 'typescriptreact', 'markdown', 'asciidoc', 'html', 'pug', 'jade', 'handlebars', 'php'], description: 'HTML keywords.' },
    { name: 'misc', locales: [], languageIds: [], description: 'List of miscellaneous terms.' },
    { name: 'node', locales: [], languageIds: ['javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'json'], description: 'List of NodeJS terms.' },
    { name: 'npm', locales: [], languageIds: ['csharp', 'javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'markdown', 'asciidoc', 'html', 'pug', 'jade', 'json', 'php'], description: 'List of Top 500 NPM packages.' },
    { name: 'powershell', locales: [], languageIds: [], description: 'Powershell Keywords.' },
    { name: 'softwareTerms', locales: [], languageIds: [], description: 'Common Software Terms.' },
    { name: 'typescript', locales: [], languageIds: ['javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'html', 'pug', 'jade', 'handlebars', 'php'], description: 'JavaScript and Typescript terms.' },
    { name: 'cpp', locales: [], languageIds: ['c', 'cpp'], description: 'C/C++ Keywords and common library functions.' },
    { name: 'django', locales: [], languageIds: ['html', 'python'], description: 'List of Python Django Framework keywords.' },
    { name: 'elixir', locales: [], languageIds: ['elixir'], description: 'Elixir dictionary for cspell.' },
    { name: 'en_us', locales: ['en', 'en-US'], languageIds: [], description: 'American English Dictionary' },
    { name: 'en-gb', locales: ['en-GB'], languageIds: [], description: 'British English Dictionary' },
    { name: 'fullstack', locales: [], languageIds: ['php', 'javascript'], description: 'Common words encountered during fullstack development' },
    { name: 'golang', locales: [], languageIds: ['go'], description: 'Go Language Dictionary' },
    { name: 'java', locales: [], languageIds: ['java'], description: 'Java dictionary for cspell.' },
    { name: 'latex', locales: [], languageIds: ['latex'], description: 'LaTeX dictionary' },
    { name: 'lorem-ipsum', locales: ['lorem', 'lorem-ipsum'], languageIds: [], description: 'Lorem-ipsum dictionary for cspell.' },
    { name: 'php', locales: [], languageIds: ['php'], description: 'Php dictionary for cspell.' },
    { name: 'python', locales: [], languageIds: ['python'], description: 'Python Keyword Dictionary' },
    { name: 'rust', locales: [], languageIds: ['rust'], description: 'Rust Keyword Dictionary' },
    { name: 'scala', locales: [], languageIds: ['scala'], description: 'Scala dictionary for cspell.' },
    { name: 'cs-cz', locales: ['cs'], languageIds: [], description: 'Czech dictionary for cspell.' },
];

const _configFiles: ConfigFile[] = [
    { name: 'dutch/cspell.json', uri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/extensions/dutch/cspell.json' },
    { name: 'vscode-cspell-dict-extensions/cspell.json', uri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/cspell.json' },
];
const _sampleSettings: Settings = {
    dictionaries,
    knownLanguageIds,
    configs: {
        user: { locales: ['en'], languageIdsEnabled: languageIdsUser, inherited: {} },
        workspace: { locales: ['en', 'da'], languageIdsEnabled: languageIdsWorkspace, inherited: {} },
        folder: { locales: ['en', 'da'], languageIdsEnabled: languageIdsWorkspace, inherited: { locales: 'workspace', languageIdsEnabled: 'workspace' } },
        file: {
            uri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/extensions/dutch/src/extension.ts',
            fileName: 'vscode-cspell-dict-extensions/extensions/dutch/src/extension.ts',
            isUntitled: false,
            languageId: 'typescript',
            languageEnabled: true,
            fileEnabled: true,
            fileIsIncluded: true,
            fileIsExcluded: false,
            fileIsInWorkspace: true,
            excludedBy: undefined,
            dictionaries: dictionaries.filter((e) => e.languageIds.includes('typescript')),
            configFiles: _configFiles,
            gitignoreInfo: undefined,
            blockedReason: undefined,
        },
    },
    workspace: sampleWorkspace,
    activeFolderUri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/extensions/dutch',
    activeFileUri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/extensions/dutch/src/extension.ts',
};

const _sampleSettingsSingleFolder: Settings = {
    dictionaries,
    knownLanguageIds,
    configs: {
        user: { locales: ['en'], languageIdsEnabled: languageIdsUser, inherited: {} },
        workspace: { locales: ['en', 'da'], languageIdsEnabled: languageIdsWorkspace, inherited: {} },
        folder: { locales: ['en', 'da'], languageIdsEnabled: languageIdsWorkspace, inherited: { locales: 'workspace', languageIdsEnabled: 'workspace' } },
        file: {
            uri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/extensions/dutch/src/extension.ts',
            fileName: 'vscode-cspell-dict-extensions/extensions/dutch/src/extension.ts',
            isUntitled: false,
            languageId: 'typescript',
            languageEnabled: true,
            fileEnabled: true,
            fileIsIncluded: true,
            fileIsExcluded: false,
            fileIsInWorkspace: true,
            excludedBy: undefined,
            dictionaries: dictionaries.filter((e) => e.languageIds.includes('typescript')),
            configFiles: _configFiles,
            gitignoreInfo: undefined,
            blockedReason: undefined,
        },
    },
    workspace: sampleWorkspaceSingleFolder,
    activeFolderUri: 'file:///Users/cspell/projects/clones/ripgrep',
    activeFileUri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/extensions/dutch/src/extension.ts',
};

const _sampleSettingsExcluded: Settings = {
    dictionaries,
    knownLanguageIds,
    configs: {
        user: { locales: ['en'], languageIdsEnabled: languageIdsUser, inherited: {} },
        workspace: { locales: ['en'], languageIdsEnabled: languageIdsWorkspace, inherited: { locales: 'user' } },
        folder: { locales: ['en'], languageIdsEnabled: languageIdsWorkspace, inherited: { locales: 'user', languageIdsEnabled: 'workspace' } },
        file: {
            uri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/package-lock.json',
            fileName: 'package-lock.json',
            isUntitled: false,
            languageId: 'json',
            languageEnabled: true,
            fileEnabled: false,
            fileIsIncluded: true,
            fileIsExcluded: true,
            fileIsInWorkspace: true,
            excludedBy: [{ glob: 'package-lock.json', id: 'VSCode-Config', configUri: _configFiles[1].uri }],
            dictionaries: dictionaries.filter((e) => e.languageIds.includes('json')),
            configFiles: _configFiles,
            gitignoreInfo: undefined,
            blockedReason: undefined,
        },
    },
    workspace: sampleWorkspace,
    activeFolderUri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions',
    activeFileUri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/package-lock.json',
};

const _sampleSettingsExcludedNotInWorkspace: Settings = {
    dictionaries,
    knownLanguageIds,
    configs: {
        user: { locales: ['en'], languageIdsEnabled: languageIdsUser, inherited: {} },
        workspace: { locales: ['en'], languageIdsEnabled: languageIdsWorkspace, inherited: { locales: 'user' } },
        folder: { locales: ['en'], languageIdsEnabled: languageIdsWorkspace, inherited: { locales: 'user', languageIdsEnabled: 'workspace' } },
        file: {
            uri: 'file:///Users/cspell/projects/other-project/package.json',
            fileName: 'package.json',
            isUntitled: false,
            languageId: 'json',
            languageEnabled: true,
            fileEnabled: false,
            fileIsIncluded: false,
            fileIsExcluded: false,
            fileIsInWorkspace: false,
            excludedBy: undefined,
            dictionaries: dictionaries.filter((e) => e.languageIds.includes('json')),
            configFiles: [],
            gitignoreInfo: undefined,
            blockedReason: undefined,
        },
    },
    workspace: sampleWorkspace,
    activeFolderUri: undefined,
    activeFileUri: 'file:///Users/cspell/projects/other-project/package.json',
};

const _sampleSettingsGitignore: Settings = {
    dictionaries,
    knownLanguageIds,
    configs: {
        user: { locales: ['en'], languageIdsEnabled: languageIdsUser, inherited: {} },
        workspace: { locales: ['en', 'da'], languageIdsEnabled: languageIdsWorkspace, inherited: {} },
        folder: { locales: ['en', 'da'], languageIdsEnabled: languageIdsWorkspace, inherited: { locales: 'workspace', languageIdsEnabled: 'workspace' } },
        file: {
            uri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/node_modules/jq/index.js',
            fileName: 'vscode-cspell-dict-extensions/node_modules/jq/index.js',
            isUntitled: false,
            languageId: 'javascript',
            languageEnabled: true,
            fileEnabled: true,
            fileIsIncluded: true,
            fileIsExcluded: false,
            fileIsInWorkspace: true,
            excludedBy: undefined,
            dictionaries: dictionaries.filter((e) => e.languageIds.includes('typescript')),
            configFiles: _configFiles,
            gitignoreInfo: {
                matched: true,
                gitignoreFileUri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/.gitignore',
                gitignoreName: '.gitignore',
                glob: 'node_modules/',
                line: 55,
                root: '/Users/cspell/projects/vscode-cspell-dict-extensions/',
            },
            blockedReason: undefined,
        },
    },
    workspace: sampleWorkspaceSingleFolder,
    activeFolderUri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions',
    activeFileUri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/node_modules/jq/index.js',
};

const _sampleSettingsBlocked: Settings = {
    dictionaries,
    knownLanguageIds,
    configs: {
        user: { locales: ['en'], languageIdsEnabled: languageIdsUser, inherited: {} },
        workspace: { locales: ['en', 'da'], languageIdsEnabled: languageIdsWorkspace, inherited: {} },
        folder: { locales: ['en', 'da'], languageIdsEnabled: languageIdsWorkspace, inherited: { locales: 'workspace', languageIdsEnabled: 'workspace' } },
        file: {
            uri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/webpack/main.js',
            fileName: 'vscode-cspell-dict-extensions/webpack/main.js',
            isUntitled: false,
            languageId: 'javascript',
            languageEnabled: true,
            fileEnabled: false,
            fileIsIncluded: true,
            fileIsExcluded: false,
            fileIsInWorkspace: true,
            excludedBy: undefined,
            dictionaries: dictionaries.filter((e) => e.languageIds.includes('typescript')),
            configFiles: _configFiles,
            gitignoreInfo: undefined,
            blockedReason: {
                code: 'Lines_too_long.',
                message: 'Lines are too long.',
                documentationRefUri: 'https://streetsidesoftware.github.io/vscode-spell-checker/docs/configuration/#cspellblockcheckingwhenlinelengthgreaterthan',
            },
        },
    },
    workspace: sampleWorkspaceSingleFolder,
    activeFolderUri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions',
    activeFileUri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/webpack/main.js',
};

export const sampleSettings = Object.freeze(_sampleSettings);
export const sampleSettingsSingleFolder = Object.freeze(_sampleSettingsSingleFolder);
export const sampleSettingsExcluded = Object.freeze(_sampleSettingsExcluded);
export const sampleSettingsExcludedNotInWorkspace = Object.freeze(_sampleSettingsExcludedNotInWorkspace);
export const sampleSettingsGitignore = Object.freeze(_sampleSettingsGitignore);
export const sampleSettingsBlocked = Object.freeze(_sampleSettingsBlocked);

// cspell:ignore ripgrep
