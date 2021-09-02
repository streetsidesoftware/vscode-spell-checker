import * as vscode from 'vscode';
import { getCSpellDiags } from './diags';

export function registerCspellInlineCompletionProviders(): vscode.Disposable[] {
    return [
        vscode.languages.registerCompletionItemProvider({ language: '*', scheme: '*' }, cspellTriggerCompletionProvider, 'c', 's', 'p'),
        vscode.languages.registerCompletionItemProvider('*', cspellInlineCompletionProvider, ':'),
    ];
}

const cspellInlineCompletionProvider: vscode.CompletionItemProvider = {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const diags = findNearestDiags(getCSpellDiags(document.uri), position, 3);
        // get all text until the `position` and check if it reads `cspell.`
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (!linePrefix.endsWith('spell:')) {
            return undefined;
        }

        const context: CompletionContext = {
            words: diags.map((d) => document.getText(d.range)),
        };

        return completions.map((c) => (typeof c === 'function' ? c(context) : c)).map(genCompletionItem);
    },
    resolveCompletionItem(item: vscode.CompletionItem) {
        return item;
    },
};

function genCompletionItem(c: Completion): vscode.CompletionItem {
    const item = new vscode.CompletionItem(c.label, c.kind || vscode.CompletionItemKind.Text);
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
    kind?: vscode.CompletionItemKind;
}

interface CompletionContext {
    words: string[];
}

type CompletionFn = (context: CompletionContext) => Completion;

const completions: (Completion | CompletionFn)[] = [
    (ctx) => {
        const placeHolders = ctx.words.map((w, i) => `\${${i + 1}:${w}}`).join(' ');

        return {
            label: 'words',
            insertText: `words ${placeHolders || '${1:word}'}`,
            description: 'Words to be allowed in the document',
            sortText: '1',
            kind: vscode.CompletionItemKind.Snippet,
        };
    },
    (ctx) => {
        const placeHolders = ctx.words.map((w, i) => `\${${i + 1}:${w}}`).join(' ');

        return {
            label: 'ignore words',
            insertText: `ignore ${placeHolders || '${1:word}'}`,
            description: 'Words to be ignored in the document',
            sortText: '2',
            kind: vscode.CompletionItemKind.Snippet,
        };
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
        kind: vscode.CompletionItemKind.Snippet,
    },
    {
        label: 'locale',
        insertText: 'locale ${1:en}',
        description: 'Set the language locale to be used in this document. (i.e. fr,en)',
        kind: vscode.CompletionItemKind.Snippet,
    },
    {
        label: 'disable compound words',
        insertText: 'disableCompoundWords',
        description: 'Turn OFF Allow Compound Words.',
    },
    {
        label: 'enable compound words',
        insertText: 'enableCompoundWords',
        description: 'Turn ON Allow Compound Words.',
    },
];

// a completion item that can be accepted by a commit character,
// the `commitCharacters`-property is set which means that the completion will
// be inserted and then the character will be typed.
const triggerText = 'cspell';
const triggerCSpellCompletion = new vscode.CompletionItem('cspell', vscode.CompletionItemKind.Snippet);
triggerCSpellCompletion.commitCharacters = [':'];
triggerCSpellCompletion.insertText = new vscode.SnippetString('${LINE_COMMENT} cspell');
triggerCSpellCompletion.documentation = new vscode.MarkdownString('Press `:` to get `cspell` options');

const cspellTriggerCompletionProvider: vscode.CompletionItemProvider = {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.CompletionContext
    ) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        const lastWord = linePrefix.split(/\s/g).pop();
        if (!lastWord || lastWord.length < 3 || !triggerText.startsWith(lastWord)) {
            return undefined;
        }

        // return all completion items as array
        return [triggerCSpellCompletion];
    },
    resolveCompletionItem(item: vscode.CompletionItem) {
        return item;
    },
};

// function flatten<T>(nested: T[][]): T[] {
//     function* _flatten<T>(nested: T[][]) {
//         for (const a of nested) {
//             yield* a;
//         }
//     }

//     return [..._flatten(nested)];
// }

function findNearestDiags(diags: vscode.Diagnostic[], position: vscode.Position, count: number): vscode.Diagnostic[] {
    /** A Simple distance calculation weighted towards lines over characters while trying to preserve order. */
    function dist(diag: vscode.Diagnostic) {
        const p0 = diag.range.start;
        const deltaLine = Math.abs(p0.line - position.line);
        return deltaLine * 1000 + p0.character;
    }

    const sorted = [...diags].sort((a, b) => dist(a) - dist(b));
    return sorted.slice(0, count);
}
