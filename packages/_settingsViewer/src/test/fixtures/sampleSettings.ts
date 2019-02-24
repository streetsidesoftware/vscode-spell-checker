import { Settings } from '../../api/settings';


export const sampleSettings: Settings = {
    configs: {
        user: {
            locals: ['en'],
            fileTypesEnabled: ['typescript', 'javascript']
        },
        workspace: undefined,
        folder: {
            locals: ['en', 'de'],
            fileTypesEnabled: ['typescript', 'javascript', 'java']
        },
        file: undefined,
    },
    locals: {
        user: ["en"],
        workspace: ["en","da"],
        file: undefined,
        folder: undefined,
    },
    dictionaries: [
        {
            "name": "companies",
            "locals": [
                "*"
            ],
            "description": "Company names dictionary for cspell."
        },
        {
            "name": "css",
            "locals": [],
            "description": "CSS Keywords."
        },
        {
            "name": "csharp",
            "locals": [],
            "description": "C# Keywords and common library functions."
        },
        {
            "name": "dotnet",
            "locals": [],
            "description": ".Net keywords."
        },
        {
            "name": "filetypes",
            "locals": [],
            "description": "List of file types."
        },
        {
            "name": "fonts",
            "locals": [],
            "description": "List of fonts."
        },
        {
            "name": "html",
            "locals": [],
            "description": "HTML keywords."
        },
        {
            "name": "misc",
            "locals": [],
            "description": "List of miscellaneous terms."
        },
        {
            "name": "node",
            "locals": [],
            "description": "List of NodeJS terms."
        },
        {
            "name": "npm",
            "locals": [],
            "description": "List of Top 500 NPM packages."
        },
        {
            "name": "powershell",
            "locals": [],
            "description": "Powershell Keywords."
        },
        {
            "name": "softwareTerms",
            "locals": [],
            "description": "Common Software Terms."
        },
        {
            "name": "typescript",
            "locals": [],
            "description": "JavaScript and Typescript terms."
        },
        {
            "name": "cpp",
            "locals": [
                "*"
            ],
            "description": "C/C++ Keywords and common library functions."
        },
        {
            "name": "django",
            "locals": [],
            "description": "List of Python Django Framework keywords."
        },
        {
            "name": "elixir",
            "locals": [
                "*"
            ],
            "description": "Elixir dictionary for cspell."
        },
        {
            "name": "en_us",
            "locals": [
                "en",
                "en-US"
            ],
            "description": "American English Dictionary"
        },
        {
            "name": "en-gb",
            "locals": [
                "en-GB"
            ],
            "description": "British English Dictionary"
        },
        {
            "name": "fullstack",
            "locals": [
                "*"
            ],
            "description": "Common words encountered during fullstack development"
        },
        {
            "name": "golang",
            "locals": [
                "*"
            ],
            "description": "Go Language Dictionary"
        },
        {
            "name": "java",
            "locals": [
                "*"
            ],
            "description": "Java dictionary for cspell."
        },
        {
            "name": "latex",
            "locals": [
                "*"
            ],
            "description": "LaTeX dictionary"
        },
        {
            "name": "lorem-ipsum",
            "locals": [
                "lorem",
                "lorem-ipsum"
            ],
            "description": "Lorem-ipsum dictionary for cspell."
        },
        {
            "name": "php",
            "locals": [
                "*"
            ],
            "description": "Php dictionary for cspell."
        },
        {
            "name": "python",
            "locals": [],
            "description": "Python Keyword Dictionary"
        },
        {
            "name": "rust",
            "locals": [
                "*"
            ],
            "description": "Rust Keyword Dictionary"
        },
        {
            "name": "scala",
            "locals": [
                "*"
            ],
            "description": "Scala dictionary for cspell."
        }
    ]
};

