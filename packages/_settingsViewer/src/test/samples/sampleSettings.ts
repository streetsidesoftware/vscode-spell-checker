import { Settings, DictionaryEntry } from '../../api/settings';
import { sampleWorkspace, sampleWorkspaceSingleFolder } from './sampleWorkspace';
import { uniqueFilter } from '../../api/utils';

const languageIdsA = [
    "asciidoc",
    "c", "cpp", "csharp", "css",
    "go", "handlebars", "html",
    "jade", "javascript", "javascriptreact", "json",
    "latex", "less",
    "markdown",
    "php", "plaintext", "pub", "python",
    "restructuredtext", "rust",
    "scss",
    "text", "typescript", "typescriptreact",
    "yml"].sort();
const languageIdsB = languageIdsA.concat(["cfml", "java", "scala", "yaml"]).sort();
const languageIdsUser = languageIdsB;
const languageIdsWorkspace = languageIdsA;
const knownLanguageIds = languageIdsA.concat(languageIdsB).concat(['jasonc', 'perl', 'sh', 'bash', 'avro']).filter(uniqueFilter()).sort();

const dictionaries: DictionaryEntry[] = [
    { name: "companies", locals: [], languageIds: [], description: "Company names dictionary for cspell." },
    { name: "css", locals: [], languageIds: ["javascriptreact", "typescriptreact", "html", "pug", "jade", "handlebars", "php", "css", "less", "scss"], description: "CSS Keywords." },
    { name: "csharp", locals: [], languageIds: ["csharp"], description: "C# Keywords and common library functions." },
    { name: "dotnet", locals: [], languageIds: ["csharp"], description: ".Net keywords." },
    { name: "filetypes", locals: [], languageIds: [], description: "List of file types." },
    { name: "fonts", locals: [], languageIds: ["javascriptreact", "typescriptreact", "html", "pug", "jade", "handlebars", "php", "css", "less", "scss"], description: "List of fonts." },
    { name: "html", locals: [], languageIds: ["javascriptreact", "typescriptreact", "markdown", "asciidoc", "html", "pug", "jade", "handlebars", "php"], description: "HTML keywords." },
    { name: "misc", locals: [], languageIds: [], description: "List of miscellaneous terms." },
    { name: "node", locals: [], languageIds: ["javascript", "javascriptreact", "typescript", "typescriptreact", "json"], description: "List of NodeJS terms." },
    { name: "npm", locals: [], languageIds: ["csharp", "javascript", "javascriptreact", "typescript", "typescriptreact", "markdown", "asciidoc", "html", "pug", "jade", "json", "php"], description: "List of Top 500 NPM packages." },
    { name: "powershell", locals: [], languageIds: [], description: "Powershell Keywords." },
    { name: "softwareTerms", locals: [], languageIds: [], description: "Common Software Terms." },
    { name: "typescript", locals: [], languageIds: ["javascript", "javascriptreact", "typescript", "typescriptreact", "html", "pug", "jade", "handlebars", "php"], description: "JavaScript and Typescript terms." },
    { name: "cpp", locals: [], languageIds: ["c", "cpp"], description: "C/C++ Keywords and common library functions." },
    { name: "django", locals: [], languageIds: ["html", "python"], description: "List of Python Django Framework keywords." },
    { name: "elixir", locals: [], languageIds: ["elixir"], description: "Elixir dictionary for cspell." },
    { name: "en_us", locals: ["en", "en-US"], languageIds: [], description: "American English Dictionary" },
    { name: "en-gb", locals: ["en-GB"], languageIds: [], description: "British English Dictionary" },
    { name: "fullstack", locals: [], languageIds: ["php", "javascript"], description: "Common words encountered during fullstack development" },
    { name: "golang", locals: [], languageIds: ["go"], description: "Go Language Dictionary" },
    { name: "java", locals: [], languageIds: ["java"], description: "Java dictionary for cspell." },
    { name: "latex", locals: [], languageIds: ["latex"], description: "LaTeX dictionary" },
    { name: "lorem-ipsum", locals: ["lorem", "lorem-ipsum"], languageIds: [], description: "Lorem-ipsum dictionary for cspell." },
    { name: "php", locals: [], languageIds: ["php"], description: "Php dictionary for cspell." },
    { name: "python", locals: [], languageIds: ["python"], description: "Python Keyword Dictionary" },
    { name: "rust", locals: [], languageIds: ["rust"], description: "Rust Keyword Dictionary" },
    { name: "scala", locals: [], languageIds: ["scala"], description: "Scala dictionary for cspell." },
    { name: "cs-cz", locals: ["cs"], languageIds: [], description: "Czech dictionary for cspell." }
];


const _sampleSettings: Settings = {
    dictionaries,
    knownLanguageIds,
    configs: {
        user: { locals: ["en"], languageIdsEnabled: languageIdsUser, inherited: {} },
        workspace: { locals: ["en", "da"], languageIdsEnabled: languageIdsWorkspace, inherited: {} },
        folder: { locals: ["en", "da"], languageIdsEnabled: languageIdsWorkspace, inherited: { locals: 'workspace', languageIdsEnabled: 'workspace' } },
        file: {
            uri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/extensions/dutch/src/extension.ts',
            fileName: 'vscode-cspell-dict-extensions/extensions/dutch/src/extension.ts',
            isUntitled: false,
            languageId: 'typescript',
            languageEnabled: true,
            fileEnabled: true,
            dictionaries: dictionaries.filter(e => e.languageIds.includes('typescript')),
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
        user: { locals: ["en"], languageIdsEnabled: languageIdsUser, inherited: {} },
        workspace: { locals: ["en", "da"], languageIdsEnabled: languageIdsWorkspace, inherited: {} },
        folder: { locals: ["en", "da"], languageIdsEnabled: languageIdsWorkspace, inherited: { locals: 'workspace', languageIdsEnabled: 'workspace' } },
        file: {
            uri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/extensions/dutch/src/extension.ts',
            fileName: 'vscode-cspell-dict-extensions/extensions/dutch/src/extension.ts',
            isUntitled: false,
            languageId: 'typescript',
            languageEnabled: true,
            fileEnabled: true,
            dictionaries: dictionaries.filter(e => e.languageIds.includes('typescript')),
        },
    },
    workspace: sampleWorkspaceSingleFolder,
    activeFolderUri: "file:///Users/cspell/projects/clones/ripgrep",
    activeFileUri: 'file:///Users/cspell/projects/vscode-cspell-dict-extensions/extensions/dutch/src/extension.ts',
};


export const sampleSettings = Object.freeze(_sampleSettings);
export const sampleSettingsSingleFolder = Object.freeze(_sampleSettingsSingleFolder);
