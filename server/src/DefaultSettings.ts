import { CSpellUserSettings, RegExpPatternDefinition, DictionaryDefinition } from './CSpellSettingsDef';
import * as LanguageSettings from './LanguageSettings';
import * as RegPat from './RegExpPatterns';


const defaultRegExpExcludeList = [
    'SpellCheckerDisable',
    'Urls',
    'PublicKey',
    'RsaCert',
    'Base64',
];


const defaultRegExpPatterns: RegExpPatternDefinition[] = [
    // Exclude patterns
    { name: 'Urls',                 pattern: RegPat.regExMatchUrls },
    { name: 'HexDigits',            pattern: RegPat.regExHexDigits },
    { name: 'HexValues',            pattern: RegPat.regExMatchCommonHexFormats },
    { name: 'SpellCheckerDisable',  pattern: RegPat.regExSpellingGuard },
    { name: 'PublicKey',            pattern: RegPat.regExPublicKey },
    { name: 'RsaCert',              pattern: RegPat.regExCert },
    { name: 'EscapeCharacters',     pattern: RegPat.regExEscapeCharacters },
    { name: 'Base64',               pattern: RegPat.regExBase64 },
    { name: 'Email',                pattern: RegPat.regExEmail },

    // Include Patterns
    { name: 'PhpHereDoc',           pattern: RegPat.regExPhpHereDoc },
    { name: 'string',               pattern: RegPat.regExString },
    { name: 'CStyleComment',        pattern: RegPat.regExCStyleComments },
    { name: 'Everything',           pattern: '.*' },
];

const defaultDictionaryDefs: DictionaryDefinition[] = [
    { name: 'companies',      file: 'companies.txt.gz',     type: 'S' },
    { name: 'cpp',            file: 'cpp.txt.gz',           type: 'S' },
    { name: 'css',            file: 'css.txt.gz',           type: 'S' },
    { name: 'csharp',         file: 'csharp.txt.gz',        type: 'S' },
    { name: 'dotnet',         file: 'dotnet.txt.gz',        type: 'S' },
    { name: 'fonts',          file: 'fonts.txt.gz',         type: 'S' },
    { name: 'go',             file: 'go.txt.gz',            type: 'S' },
    { name: 'html',           file: 'html.txt.gz',          type: 'S' },
    { name: 'misc',           file: 'miscTerms.txt.gz',     type: 'S' },
    { name: 'node',           file: 'node.txt.gz',          type: 'S' },
    { name: 'npm',            file: 'npm.txt.gz',           type: 'S' },
    { name: 'php',            file: 'php.txt.gz',           type: 'S' },
    { name: 'powershell',     file: 'powershell.txt.gz',    type: 'S' },
    { name: 'python',         file: 'python.txt.gz',        type: 'S' },
    { name: 'softwareTerms',  file: 'softwareTerms.txt.gz', type: 'S' },
    { name: 'typescript',     file: 'typescript.txt.gz',    type: 'S' },
    { name: 'wordsEn',        file: 'wordsEn.txt.gz',       type: 'S' },
    { name: 'wordsEnGb',      file: 'wordsEnGb.txt.gz',     type: 'S' },
];


const defaultSettings: CSpellUserSettings = {
    language: 'en',
    enabledLanguageIds: [
        'csharp', 'go', 'javascript', 'javascriptreact', 'json', 'markdown',
        'php', 'plaintext', 'python', 'text', 'typescript', 'typescriptreact'
    ],
    maxNumberOfProblems: 100,
    numSuggestions: 10,
    spellCheckDelayMs: 50,
    words: [],
    userWords: [],
    ignorePaths: [],
    allowCompoundWords: false,
    patterns: defaultRegExpPatterns,
    ignoreRegExpList: defaultRegExpExcludeList,
    languageSettings: LanguageSettings.defaultLanguageSettings,
    dictionaryDefinitions: defaultDictionaryDefs,
};


export function getDefaultSettings(): CSpellUserSettings {
    return {...defaultSettings};
}
