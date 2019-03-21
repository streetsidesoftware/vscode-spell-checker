import { Workspace, TextDocument } from '../../api/settings';

// cspell:ignore ripgrep

const textDocuments: TextDocument[] = [{
    "uri": "file:///Users/cspell/projects/clones/ripgrep/.vscode/settings.json",
    "fileName": "ripgrep/.vscode/settings.json",
    "isUntitled": false,
    "languageId": "jsonc"
}, {
    "fileName": "vscode-cspell-dict-extensions/extensions/dutch/src/extension.ts",
    "isUntitled": false,
    "languageId": "typescript",
    "uri": "file:///Users/cspell/projects/vscode-cspell-dict-extensions/extensions/dutch/src/extension.ts"
},
{
    "uri": "file:///Users/cspell/projects/clones/ripgrep/src/decoder.rs",
    "fileName": "ripgrep/src/decoder.rs",
    "isUntitled": false,
    "languageId": "rust",
}];

const _sampleWorkspace: Workspace = {
    "workspaceFolders": [{
        "uri": "file:///Users/cspell/projects/clones/ripgrep",
        "name": "ripgrep",
        "index": 0
    }, {
        "index": 1,
        "name": "dutch",
        "uri": "file:///Users/cspell/projects/vscode-cspell-dict-extensions/extensions/dutch"
    }
    ],
    "name": "ripgrep",
    textDocuments,
};

const _sampleWorkspaceSingleFolder: Workspace = {
    "workspaceFolders": [{
        "uri": "file:///Users/cspell/projects/clones/ripgrep",
        "name": "ripgrep",
        "index": 0
    }
    ],
    "name": "ripgrep",
    textDocuments,
};

export const sampleWorkspace = Object.freeze(_sampleWorkspace);
export const sampleWorkspaceSingleFolder = Object.freeze(_sampleWorkspaceSingleFolder);
