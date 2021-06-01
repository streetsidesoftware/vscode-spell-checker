import * as vscode from 'vscode';

export function registerCspellInlineCompletionProviders(): vscode.Disposable[] {
    return [
        vscode.languages.registerCompletionItemProvider(selector, cspellTriggerCompletionProvider, 'p'),
        vscode.languages.registerCompletionItemProvider(selector, cspellInlineCompletionProvider, ':'),
    ];
}

const selector = '*'; // [{ scheme: 'file', language: 'markdown' }, { scheme: 'undefined', language: '*' }, '*'];

const cspellInlineCompletionProvider: vscode.CompletionItemProvider = {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        // get all text until the `position` and check if it reads `cspell.`
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (!linePrefix.endsWith('spell:')) {
            return undefined;
        }

        return completions.map(genCompletionItem);
    },
};

function genCompletionItem(c: Completion): vscode.CompletionItem {
    const item = new vscode.CompletionItem(c.label, vscode.CompletionItemKind.Text);
    item.insertText = new vscode.SnippetString(c.insertText);
    item.documentation = c.description;
    item.sortText = c.sortText;
    return item;
}

interface Completion {
    label: string;
    insertText: string;
    description: string;
    sortText?: string;
}

const completions: Completion[] = [
    {
        label: 'words',
        insertText: 'words ${1:word} ${2:word}',
        description: 'Words to be allowed in the document',
        sortText: '1',
    },
    {
        label: 'ignore words',
        insertText: 'ignore ${1:word} ${2:word}',
        description: 'Words to be ignored in the document',
        sortText: '2',
    },
    {
        label: 'ignoreRegExp',
        insertText: 'ignoreRegExp /${1:expression}/g',
        description: 'Ignore text matching the regular expression.',
    },
    {
        label: 'disable-next-line',
        insertText: 'disable-next-line',
        description: 'Do not spell check the next line',
        sortText: '3',
    },
    {
        label: 'disable-line',
        insertText: 'disable-line',
        description: 'Do not spell check the current line',
    },
    {
        label: 'disable spell checker',
        insertText: 'disable',
        description: 'Disable spell checking from this point further.',
    },
    {
        label: 'enable spell checker',
        insertText: 'enable',
        description: 'Enable spell checking from this point further.',
    },
    {
        label: 'dictionaries',
        insertText: 'dictionaries ${1:dictionary_name}',
        description: 'Add dictionaries to be used in this document.',
    },
];

// a completion item that can be accepted by a commit character,
// the `commitCharacters`-property is set which means that the completion will
// be inserted and then the character will be typed.
const triggerCSpellCompletion = new vscode.CompletionItem('cspell');
triggerCSpellCompletion.commitCharacters = [':'];
triggerCSpellCompletion.insertText = 'cspell';
triggerCSpellCompletion.documentation = new vscode.MarkdownString('Press `:` to get `cspell` options');

const cspellTriggerCompletionProvider: vscode.CompletionItemProvider = {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.CompletionContext
    ) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (!linePrefix.endsWith('csp')) {
            return undefined;
        }

        // return all completion items as array
        return [triggerCSpellCompletion];
    },
};
