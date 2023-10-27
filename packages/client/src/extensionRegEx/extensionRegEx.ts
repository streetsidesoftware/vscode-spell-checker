import { format } from 'util';
import * as vscode from 'vscode';

import type { CSpellClient, CSpellUserSettings } from '../client';
import { extensionId } from '../constants';
import { catchErrors, isError, logError, logErrors, showError } from '../util/errors';
import { toRegExp } from './evaluateRegExp';
import { PatternMatcherClient } from './patternMatcherClient';
import type { RegexpOutlineItem } from './RegexpOutlineProvider';
import { RegexpOutlineProvider } from './RegexpOutlineProvider';
import type { NamedPattern, PatternMatch, PatternSettings } from './server';

interface DisposableLike {
    dispose(): unknown;
}

const MAX_HISTORY_LENGTH = 5;

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext, clientSpellChecker: CSpellClient): void {
    const disposables = new Set<DisposableLike>();
    const outline = new RegexpOutlineProvider();
    let patternMatcherClient: PatternMatcherClient | undefined;

    disposables.add(vscode.window.registerTreeDataProvider('cSpellRegExpView', outline));

    let timeout: NodeJS.Timeout | undefined = undefined;

    // create a decorator type that we use to decorate small numbers
    const decorationTypeExclude = vscode.window.createTextEditorDecorationType({
        // borderWidth: '1px',
        // borderStyle: 'solid',
        overviewRulerColor: 'green',
        overviewRulerLane: vscode.OverviewRulerLane.Center,
        light: {
            // this color will be used in light color themes
            // borderColor: 'darkblue',
            backgroundColor: '#C0C0FFCC',
        },
        dark: {
            // this color will be used in dark color themes
            // borderColor: 'lightblue',
            backgroundColor: '#347890CC',
        },
    });

    let isActive = fetchIsEnabledFromConfig();

    let activeEditor = isActive ? vscode.window.activeTextEditor : undefined;
    let pattern: string | undefined = undefined;
    let history: string[] = [];

    const updateDecorations = catchErrors(_updateDecorations, 'updateDecorations', showError);

    async function _updateDecorations() {
        disposeCurrent();
        if (!isActive || !activeEditor) {
            clearDecorations();
            return;
        }

        const document = activeEditor.document;
        const version = document.version;
        const config = await clientSpellChecker.getConfigurationForDocument(document);
        const extractedPatterns = extractPatternsFromConfig(config.docSettings, history);
        const patterns = extractedPatterns.map((p) => p.pattern);

        const highlightIndex = pattern ? 0 : -1;

        const client = await getPatternMatcherClient();
        const patternSettings: PatternSettings = {
            patterns: config.docSettings?.patterns || config.settings?.patterns || [],
        };

        await client.matchPatternsInDocument(document, patterns, patternSettings).then((result) => {
            if (!vscode.window.activeTextEditor || document.version !== version || vscode.window.activeTextEditor?.document != document) {
                return;
            }
            if (result.message) {
                // @todo: show the message.
                return;
            }
            const byCategory: Map<string, PatternMatch[]> | undefined = result && new Map();

            result?.patternMatches.forEach((m: PatternMatch, i: number) => {
                const category = extractedPatterns[i].category;
                const matches = byCategory?.get(category) || [];
                matches.push(m);
                byCategory?.set(category, matches);
            });

            outline.refresh(byCategory);
            const activeEditor = vscode.window.activeTextEditor;
            const flattenResults = result.patternMatches
                .filter((_, i) => i === highlightIndex)
                .map(mapPatternMatchToRangeMessage)
                .reduce((a, v) => a.concat(v), []);
            const decorations: vscode.DecorationOptions[] = flattenResults.map((match) => {
                const { range, message } = match;
                const startPos = activeEditor.document.positionAt(range[0]);
                const endPos = activeEditor.document.positionAt(range[1]);
                const decoration: vscode.DecorationOptions = { range: new vscode.Range(startPos, endPos), hoverMessage: message };
                return decoration;
            });
            activeEditor.setDecorations(decorationTypeExclude, decorations);
            return;
        });
    }

    function mapPatternMatchToRangeMessage(match: PatternMatch) {
        const { name, defs } = match;
        return defs
            .map((d) =>
                d.matches
                    .map((range) => ({ range, elapsedTime: d.elapsedTime }))
                    .map(({ range, elapsedTime }) => ({ range, message: createHoverMessage(name, elapsedTime) })),
            )
            .reduce((a, m) => a.concat(m), []);
    }

    function clearDecorations() {
        activeEditor?.setDecorations(decorationTypeExclude, []);
    }

    function createHoverMessage(name: string, elapsedTime: number) {
        const r = new vscode.MarkdownString().appendText(name + ' ' + elapsedTime.toFixed(2) + 'ms');
        return r;
    }

    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        timeout = setTimeout(updateDecorations, 100);
    }

    if (activeEditor) {
        triggerUpdateDecorations();
    }

    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            if (isActive) {
                activeEditor = editor;
                if (editor) {
                    triggerUpdateDecorations();
                }
            }
        },
        null,
        context.subscriptions,
    );

    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            if (isActive && activeEditor && event.document === activeEditor.document) {
                triggerUpdateDecorations();
            }
        },
        null,
        context.subscriptions,
    );

    function disposeCurrent() {
        // current?.execResult?.dispose();
    }

    function userTestRegExp(defaultRegexp?: string) {
        function validateInput(input: string) {
            try {
                toRegExp(input, 'g');
            } catch (e) {
                if (isError(e)) return e.message;
                return format(e);
            }
        }
        pattern = defaultRegexp || pattern;
        const p = vscode.window
            .showInputBox({
                prompt: 'Enter a Regular Expression',
                placeHolder: 'Example: /\bw+/g',
                value: pattern?.toString(),
                validateInput,
            })
            .then((value) => {
                pattern = value ? value : undefined;
                updateHistory(pattern);
                triggerUpdateDecorations();
                return;
            });
        return logErrors(p, 'userTestRegExp');
    }

    function isNonEmptyString(s: string | undefined): s is string {
        return typeof s === 'string' && !!s;
    }

    function updateHistory(pattern?: string) {
        const unique = new Set([pattern].concat(history));
        history = [...unique].filter(isNonEmptyString);
        history.length = Math.min(history.length, MAX_HISTORY_LENGTH);
    }

    function userSelectRegExp(selectedRegExp?: string) {
        if (pattern === selectedRegExp) {
            pattern = undefined;
        } else {
            pattern = selectedRegExp;
        }
        updateHistory(pattern);
        triggerUpdateDecorations();
    }

    function editRegExp(item: { treeItem: RegexpOutlineItem } | undefined) {
        if (item?.treeItem?.pattern) {
            triggerUpdateDecorations();
            const { defs, name } = item.treeItem.pattern;
            userTestRegExp(defs[0]?.regexp || name);
        }
    }

    function updateIsActive() {
        const currentIsActive = isActive;
        isActive = fetchIsEnabledFromConfig();
        if (currentIsActive == isActive) {
            return;
        }
        if (isActive) {
            activeEditor = vscode.window.activeTextEditor;
            triggerUpdateDecorations();
        } else {
            clearDecorations();
        }
    }

    function getPatternMatcherClient(): Promise<PatternMatcherClient> {
        if (!patternMatcherClient) {
            patternMatcherClient = PatternMatcherClient.create(context);
        }
        const client = patternMatcherClient;
        return client.onReady().then(() => client);
    }

    function dispose() {
        disposeCurrent();
        for (const d of disposables) {
            d.dispose();
        }
        disposables.clear();
    }

    context.subscriptions.push(
        { dispose },
        vscode.commands.registerCommand('cSpellRegExpTester.testRegExp', catchErrors(userTestRegExp, 'testRegExp', logError)),
        vscode.commands.registerCommand('cSpellRegExpTester.selectRegExp', userSelectRegExp),
        vscode.commands.registerCommand('cSpellRegExpTester.editRegExp', editRegExp),
        vscode.workspace.onDidChangeConfiguration(updateIsActive),
    );
}

interface ExtractedPattern {
    category: string;
    pattern: string | NamedPattern;
}

function extractPatternsFromConfig(config: CSpellUserSettings | undefined, userPatterns: string[]): ExtractedPattern[] {
    const extractedPatterns: ExtractedPattern[] = [];

    userPatterns.forEach((p) => extractedPatterns.push({ category: 'User Patterns', pattern: p }));
    config?.includeRegExpList?.forEach((p) => extractedPatterns.push({ category: 'Include Regexp List', pattern: p.toString() }));
    config?.ignoreRegExpList?.forEach((p) => extractedPatterns.push({ category: 'Exclude Regexp List', pattern: p.toString() }));
    config?.patterns?.forEach((p) => extractedPatterns.push({ category: 'Patterns', pattern: mapPatternDef(p) }));
    return extractedPatterns;
}

interface PatternDef {
    name: string;
    pattern: string | RegExp | (string | RegExp)[];
}

function mapPatternDef(r: PatternDef): NamedPattern {
    const { name, pattern } = r;

    function cvtR(r: string | RegExp): string {
        return r.toString();
    }

    function cvt(p: PatternDef['pattern']): string | string[] {
        if (Array.isArray(p)) {
            return p.map(cvtR);
        }
        return cvtR(p);
    }

    return {
        name,
        pattern: cvt(pattern),
    };
}

function fetchIsEnabledFromConfig(): boolean {
    const cfg = vscode.workspace.getConfiguration(extensionId);
    return !!cfg?.get('experimental.enableRegexpView');
}
