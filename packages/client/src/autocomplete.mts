import { createAutoResolveCache } from '@internal/common-utils';
import type { InlineCompletionContext, InlineCompletionItemProvider, Position, TextDocument } from 'vscode';
import * as vscode from 'vscode';
import { InlineCompletionItem, InlineCompletionList, Range, SnippetString } from 'vscode';

import type { GetConfigurationForDocumentResult } from './client/index.mjs';
import { DocumentConfigCache } from './client/index.mjs';
import * as di from './di.mjs';
import { getCSpellDiags } from './diags.mjs';
import type { Disposable } from './disposable.js';
import type { SpellingDiagnostic } from './issueTracker.mjs';
import { getSettingFromVSConfig } from './settings/vsConfig.mjs';

const regExCSpellInDocDirective = /\b(?:spell-?checker|c?spell|LocalWords)::?(.*)/gi;
const regExCSpellDirectiveKey = /(?<=\b(?:spell-?checker|c?spell)::?)(?!:)\s*(.*)/i;
// const regExInFileSettings = [regExCSpellInDocDirective, /\b(LocalWords:?.*)/g];

const directivePrefixes = [
    { pfx: 'cspell:', min: 3 },
    { pfx: 'cSpell:', min: 2 },
    { pfx: 'spell:', min: 5 },
    { pfx: 'spell-checker:', min: 5 },
    { pfx: 'spellchecker:', min: 5 },
    { pfx: 'LocalWords:', min: 6 },
] as const;

export async function registerCspellInlineCompletionProviders(subscriptions: Disposable[]): Promise<void> {
    subscriptions.push(vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, inlineDirectiveCompletionProvider));
}

interface Completion {
    label: string;
    insertText: string;
    snippetText?: string;
    description: string;
    sortText?: string;
    kind?: vscode.CompletionItemKind;
    commitCharacters?: string[];
}

const inlineCompletions: Completion[] = [
    {
        label: 'words',
        insertText: 'words',
        description: 'Words to be allowed in the document',
        sortText: '1',
    },
    {
        label: 'ignore words',
        insertText: 'ignore',
        description: 'Words to be ignored in the document',
        sortText: '2',
    },
    {
        label: 'ignoreRegExp',
        insertText: 'ignoreRegExp',
        snippetText: 'ignoreRegExp /${1:expression}/g',
        description: 'Ignore text matching the regular expression.',
        kind: vscode.CompletionItemKind.Snippet,
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
        insertText: 'dictionaries',
        commitCharacters: [' '],
        description: 'Add dictionaries to be used in this document.',
    },
    {
        label: 'locale',
        insertText: 'locale',
        snippetText: 'locale ${1:en}',
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

function getShowAutocompleteSuggestions(docUri: vscode.Uri): boolean {
    const key = 'showAutocompleteDirectiveSuggestions';
    try {
        return getSettingFromVSConfig(key, docUri) ?? true;
    } catch (e) {
        return false;
    }
}

interface DictionaryInfoForDoc {
    available: string[] | undefined;
    enabled: string[] | undefined;
}

class CSpellInlineDirectiveCompletionProvider implements InlineCompletionItemProvider {
    private cacheConfig: DocumentConfigCache;
    private cacheDocDictionaries = createAutoResolveCache<string, DictionaryInfoForDoc>();

    constructor() {
        this.cacheConfig = new DocumentConfigCache((doc) => di.get('client').getConfigurationForDocument(doc));
    }

    provideInlineCompletionItems(
        document: TextDocument,
        position: Position,
        _context: InlineCompletionContext,
        _token: vscode.CancellationToken,
    ) {
        if (!getShowAutocompleteSuggestions(document.uri)) return undefined;
        const cfg = this.getConfigForDocument(document);
        if (!cfg) return undefined;

        const line = document.lineAt(position.line);
        const lineText = line.text;
        const linePrefix = lineText.slice(0, position.character);
        const match = linePrefix.match(regExCSpellInDocDirective);
        // console.log('inlineDirectiveCompletionProvider %o', { match, context, linePrefix });
        if (!match) {
            return generateDirectivePrefixCompletionItems(linePrefix, position);
        }

        const result: InlineCompletionList = {
            items: [],
        };

        const regDir = new RegExp(regExCSpellDirectiveKey);
        const matchIndex = match.index || 0;
        regDir.lastIndex = matchIndex;
        const matchDir = regDir.exec(linePrefix);
        if (!matchDir) {
            const directiveLocalWords = 'LocalWords:';
            if (match[0].startsWith(directiveLocalWords)) {
                return generateWordInlineCompletionItems(document, position, lineText, matchIndex + directiveLocalWords.length);
            }
            return undefined;
        }

        const directive = matchDir[1];
        const startChar = (matchDir.index || 0) + matchDir[0].length - directive.length;

        // console.log('inlineDirectiveCompletionProvider %o', { directive, context });

        if (directive.startsWith('dictionaries') || directive.startsWith('dictionary')) {
            return generateDictionaryNameInlineCompletionItems(document, position, lineText, startChar, (document) =>
                this.getListOfDictionaries(document),
            );
        }

        if (directive.startsWith('words') || directive.startsWith('ignore')) {
            return generateWordInlineCompletionItems(document, position, lineText, getDirectiveStart(lineText, startChar));
        }

        const parts = directive.split(/\s+/);
        if (parts.length > 1) return undefined;

        const range = new vscode.Range(position.line, startChar, position.line, position.character);
        const completions = inlineCompletions.filter((c) => c.insertText.startsWith(parts[0])).map((c) => toInlineCompletionItem(c, range));

        result.items.push(...completions);

        return result;
    }

    getConfigForDocument(document: TextDocument): GetConfigurationForDocumentResult | undefined {
        return this.cacheConfig.get(document.uri);
    }

    getListOfDictionaries(document: TextDocument): DictionaryInfoForDoc {
        const settings = this.getConfigForDocument(document);

        const key = document.uri.toString();
        const result = this.cacheDocDictionaries.get(key, () => ({ available: undefined, enabled: undefined }));

        if (!settings) return result;
        const docSettings = settings.docSettings || settings.settings;
        if (!docSettings) return result;
        const calc = createDictionaryInfoForDoc(settings);
        this.cacheDocDictionaries.set(key, calc);
        return calc;
    }
}

function generateDirectivePrefixCompletionItems(linePrefix: string, position: Position): InlineCompletionList | undefined {
    const result: InlineCompletionList = {
        items: [],
    };

    const p = linePrefix.lastIndexOf(' ');
    const startChar = p + 1;
    const directivePrefix = linePrefix.slice(startChar);
    const dLen = directivePrefix.length;
    const matches = directivePrefixes.filter((p) => p.pfx.startsWith(directivePrefix) && dLen >= p.min).map((p) => p.pfx);
    // console.log('generateDirectivePrefixCompletionItems %o', { linePrefix, position, matches });
    if (!matches.length) return undefined;

    const range = new Range(position.line, startChar, position.line, position.character);
    const items = matches.map((insertText) => new InlineCompletionItem(insertText, range));

    result.items.push(...items);

    // console.log('generateDirectivePrefixCompletionItems %o', { linePrefix, position, matches, items });

    return result;
}

function toInlineCompletionItem(item: Completion, range: Range): InlineCompletionItem {
    if (item.snippetText) {
        const snippet = new SnippetString(item.snippetText);
        const result = new InlineCompletionItem(snippet, range);
        result.filterText = item.insertText;
    }
    const result = new InlineCompletionItem(item.insertText, range);
    return result;
}

function generateDictionaryNameInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    line: string,
    startIndexForDirective: number,
    getListOfDictionaries: (document: vscode.TextDocument) => DictionaryInfoForDoc,
): InlineCompletionList | undefined {
    const regDir = new RegExp(regExCSpellDirectiveKey, 's');
    regDir.lastIndex = startIndexForDirective;
    const matchDirective = regDir.exec(line);
    if (!matchDirective) return undefined;

    const directive = matchDirective[1];
    const startDirChar = (matchDirective.index || 0) + matchDirective[0].length - directive.length;
    const curIndex = position.character;

    const endIndex = findNextNonWordChar(line, startDirChar);

    if (endIndex < curIndex) return undefined;

    const dictInfo = getListOfDictionaries(document);
    if (!dictInfo.available) return undefined;

    const regExHasSpaceAfter = /\s|$/ms;
    regExHasSpaceAfter.lastIndex = curIndex;
    const suffix = regExHasSpaceAfter.exec(line) ? '' : ' ';
    const lastWordBreak = line.lastIndexOf(' ', curIndex - 1) + 1;
    const prefix = lastWordBreak <= startDirChar ? ' ' : '';

    const regExSplitNames = /[\s,]+/g;

    const namesBefore = line.slice(startDirChar, lastWordBreak).split(regExSplitNames);
    const namesAfter = line.slice(curIndex, endIndex).split(regExSplitNames);

    const enabledDicts = new Set([...(dictInfo.enabled || []), ...namesBefore, ...namesAfter]);

    const dicts = dictInfo.available.filter((name) => !enabledDicts.has(name));

    if (!dicts.length) return undefined;

    const range = new Range(position.line, lastWordBreak, position.line, curIndex);

    return new InlineCompletionList(dicts.map((insertText) => new InlineCompletionItem(prefix + insertText + suffix, range)));
}

/**
 * Handle `words` and `ignore` inline completions.
 * @param document - document
 * @param position - cursor position
 * @param line - line text
 * @param startIndexForDirective - start index of the directive
 */
function generateWordInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    line: string,
    startDirChar: number,
): InlineCompletionList | undefined {
    const curIndex = position.character;

    const endIndex = findNextNonWordChar(line, startDirChar);

    if (endIndex < curIndex) return undefined;

    const issues = getIssues(document);
    if (!issues.length) return undefined;

    const regExHasSpaceAfter = /\s|$/ms;
    regExHasSpaceAfter.lastIndex = curIndex;
    const suffix = regExHasSpaceAfter.exec(line) ? '' : ' ';
    const lastWordBreak = line.lastIndexOf(' ', curIndex - 1) + 1;
    const prefix = lastWordBreak <= startDirChar ? ' ' : '';
    const wordPrefix = line.slice(prefix ? curIndex : lastWordBreak, curIndex);
    const words = sortIssuesBy(document, position, issues, wordPrefix);
    // console.log('words: %o', { words, directive, curIndex, endIndex, lastWordBreak, prefix, suffix });
    const range = new Range(position.line, lastWordBreak, position.line, curIndex);

    return new InlineCompletionList(words.map((insertText) => new InlineCompletionItem(prefix + insertText + suffix, range)));
}

function getDirectiveStart(line: string, startIndexForDirective: number): number {
    const regDir = new RegExp(regExCSpellDirectiveKey, 's');
    regDir.lastIndex = startIndexForDirective;
    const matchDirective = regDir.exec(line);
    if (!matchDirective) return 0;

    const directive = matchDirective[1];
    const startDirChar = (matchDirective.index || 0) + matchDirective[0].length - directive.length;

    return startDirChar;
}

function sortIssuesBy(document: TextDocument, position: Position, issues: SpellingDiagnostic[], wordPrefix: string): string[] {
    // Look for close by issues first, otherwise sort alphabetically.

    const numLines = 3;
    const line = position.line;
    const nearbyRange = new Range(Math.max(line - numLines, 0), 0, line + numLines, 0);
    const nearbyIssues = issues
        .filter((i) => nearbyRange.contains(i.range))
        .filter((i) => document.getText(i.range).startsWith(wordPrefix));
    if (nearbyIssues.length) {
        nearbyIssues.sort((a, b) => Math.abs(a.range.start.line - line) - Math.abs(b.range.start.line - line));
        const words = new Set(nearbyIssues.map((i) => document.getText(i.range)));
        return [...words];
    }
    const words = [...new Set(issues.map((i) => document.getText(i.range)))];
    words.sort();
    return words;
}

function findNextNonWordChar(line: string, start: number): number {
    const regExNonDictionaryNameCharacters = /[^a-z0-9_\s,\p{L}-]/giu;
    regExNonDictionaryNameCharacters.lastIndex = start;
    const r = regExNonDictionaryNameCharacters.exec(line);
    if (!r) return line.length;
    return r.index;
}

const inlineDirectiveCompletionProvider: InlineCompletionItemProvider = new CSpellInlineDirectiveCompletionProvider();

function createDictionaryInfoForDoc(config: GetConfigurationForDocumentResult): DictionaryInfoForDoc {
    try {
        const dicts = (config.docSettings?.dictionaryDefinitions || [])
            .filter((a) => !!a)
            .map((def) => def.name)
            .filter((a) => !!a);
        const enabled = config.docSettings?.dictionaries || [];
        return { available: dicts, enabled };
    } catch (e) {
        return { available: undefined, enabled: undefined };
    }
}

function getIssues(doc: TextDocument) {
    return getCSpellDiags(doc.uri).filter((issue) => !issue.data?.issueType);
}
