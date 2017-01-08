import { CSpellUserSettings, RegExpPatternDefinition, DictionaryDefinition } from './CSpellSettingsDef';
import * as LanguageSettings from './LanguageSettings';
import * as RegPat from './RegExpPatterns';


const defaultRegExpExcludeList = [
    'SpellCheckerDisable',
    'Urls',
    'PublicKey',
    'RsaCert',
    'EscapeCharacters',
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
    { name: 'wordsEn',        file: 'wordsEn.txt.gz',       type: 'S' },
    { name: 'typescript',     file: 'typescript.txt',       type: 'C' },
    { name: 'node',           file: 'node.txt',             type: 'C' },
    { name: 'softwareTerms',  file: 'softwareTerms.txt',    type: 'W' },
    { name: 'html',           file: 'html.txt',             type: 'S' },
    { name: 'php',            file: 'php.txt',              type: 'C' },
    { name: 'go',             file: 'go.txt',               type: 'C' },
    { name: 'companies',      file: 'companies.txt',        type: 'C' },
    { name: 'python',         file: 'python.txt',           type: 'C' },
    { name: 'fonts',          file: 'fonts.txt',            type: 'C' },
    { name: 'css',            file: 'css.txt',              type: 'S' },
    { name: 'powershell',     file: 'powershell.txt',       type: 'C' },
];


const defaultSettings: CSpellUserSettings = {
    enabledLanguageIds: [
        'csharp', 'go', 'javascript', 'javascriptreact', 'markdown',
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
