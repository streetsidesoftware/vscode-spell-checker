import { Settings } from '../../api/settings';
import { sampleWorkspace } from './sampleWorkspace';

const fileTypesA = [
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
const fileTypesB = fileTypesA.concat(["cfml", "java", "scala", "yaml"]).sort();
const fileTypesUser = fileTypesB;
const fileTypesWorkspace = fileTypesA;

export const sampleSettings: Settings = Object.freeze({
    dictionaries: [
        { name: "companies", locals: [], fileTypes: [], description: "Company names dictionary for cspell." },
        { name: "css", locals: [], fileTypes: ["javascriptreact", "typescriptreact", "html", "pug", "jade", "handlebars", "php", "css", "less", "scss"], description: "CSS Keywords." },
        { name: "csharp", locals: [], fileTypes: ["csharp"], description: "C# Keywords and common library functions." },
        { name: "dotnet", locals: [], fileTypes: ["csharp"], description: ".Net keywords." },
        { name: "filetypes", locals: [], fileTypes: [], description: "List of file types." },
        { name: "fonts", locals: [], fileTypes: ["javascriptreact", "typescriptreact", "html", "pug", "jade", "handlebars", "php", "css", "less", "scss"], description: "List of fonts." },
        { name: "html", locals: [], fileTypes: ["javascriptreact", "typescriptreact", "markdown", "asciidoc", "html", "pug", "jade", "handlebars", "php"], description: "HTML keywords." },
        { name: "misc", locals: [], fileTypes: [], description: "List of miscellaneous terms." },
        { name: "node", locals: [], fileTypes: ["javascript", "javascriptreact", "typescript", "typescriptreact", "json"], description: "List of NodeJS terms." },
        { name: "npm", locals: [], fileTypes: ["csharp", "javascript", "javascriptreact", "typescript", "typescriptreact", "markdown", "asciidoc", "html", "pug", "jade", "json", "php"], description: "List of Top 500 NPM packages." },
        { name: "powershell", locals: [], fileTypes: [], description: "Powershell Keywords." },
        { name: "softwareTerms", locals: [], fileTypes: [], description: "Common Software Terms." },
        { name: "typescript", locals: [], fileTypes: ["javascript", "javascriptreact", "typescript", "typescriptreact", "html", "pug", "jade", "handlebars", "php"], description: "JavaScript and Typescript terms." },
        { name: "cpp", locals: [], fileTypes: ["c", "cpp"], description: "C/C++ Keywords and common library functions." },
        { name: "django", locals: [], fileTypes: ["html", "python"], description: "List of Python Django Framework keywords." },
        { name: "elixir", locals: [], fileTypes: ["elixir"], description: "Elixir dictionary for cspell." },
        { name: "en_us", locals: ["en", "en-US"], fileTypes: [], description: "American English Dictionary" },
        { name: "en-gb", locals: ["en-GB"], fileTypes: [], description: "British English Dictionary" },
        { name: "fullstack", locals: [], fileTypes: ["php", "javascript"], description: "Common words encountered during fullstack development" },
        { name: "golang", locals: [], fileTypes: ["go"], description: "Go Language Dictionary" },
        { name: "java", locals: [], fileTypes: ["java"], description: "Java dictionary for cspell." },
        { name: "latex", locals: [], fileTypes: ["latex"], description: "LaTeX dictionary" },
        { name: "lorem-ipsum", locals: ["lorem", "lorem-ipsum"], fileTypes: [], description: "Lorem-ipsum dictionary for cspell." },
        { name: "php", locals: [], fileTypes: ["php"], description: "Php dictionary for cspell." },
        { name: "python", locals: [], fileTypes: ["python"], description: "Python Keyword Dictionary" },
        { name: "rust", locals: [], fileTypes: ["rust"], description: "Rust Keyword Dictionary" },
        { name: "scala", locals: [], fileTypes: ["scala"], description: "Scala dictionary for cspell." },
        { name: "cs-cz", locals: ["cs"], fileTypes: [], description: "Czech dictionary for cspell." }
    ],
    configs: {
        user: { locals: ["en"], fileTypesEnabled: fileTypesUser },
        workspace: { locals: ["en", "da"], fileTypesEnabled: fileTypesWorkspace },
        folder: { locals: [], fileTypesEnabled: undefined },
        file: undefined,
    },
    workspace: sampleWorkspace
});

