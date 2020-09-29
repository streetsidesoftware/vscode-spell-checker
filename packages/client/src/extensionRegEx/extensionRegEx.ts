import * as vscode from 'vscode';
import { CSpellClient } from '../client';
import { PatternMatch, CSpellUserSettings, NamedPattern } from '../server';
import { toRegExp } from './evaluateRegExp';
import { RegexpOutlineItem, RegexpOutlineProvider } from './RegexpOutlineProvider';

interface DisposableLike {
	dispose(): any;
}

const MAX_HISTORY_LENGTH = 5;

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext, client: CSpellClient): void {

	const disposables = new Set<DisposableLike>();
	const outline = new RegexpOutlineProvider();
	vscode.window.registerTreeDataProvider('cSpellRegExpView', outline);

	let timeout: NodeJS.Timer | undefined = undefined;

	// create a decorator type that we use to decorate small numbers
	const decorationTypeExclude = vscode.window.createTextEditorDecorationType({
		// borderWidth: '1px',
		// borderStyle: 'solid',
		overviewRulerColor: 'green',
		overviewRulerLane: vscode.OverviewRulerLane.Center,
		light: {
			// this color will be used in light color themes
			// borderColor: 'darkblue',
			backgroundColor: '#C0C0FF44',
		},
		dark: {
			// this color will be used in dark color themes
			// borderColor: 'lightblue',
			backgroundColor: '#34789044',
		}
	});

	let isActive = fetchIsEnabledFromConfig();

	let activeEditor = isActive ? vscode.window.activeTextEditor : undefined;
	let pattern: string | undefined = undefined;
	let history: string[] = [];

	async function updateDecorations() {
		disposeCurrent();
		if (!isActive || !activeEditor) {
			clearDecorations();
			return;
		}

		const document = activeEditor.document;
		const version = document.version;
		const config = await client.getConfigurationForDocument(document);
		const extractedPatterns = extractPatternsFromConfig(config.docSettings, history);
		const patterns = extractedPatterns.map(p => p.pattern);

		const highlightIndex = pattern ? 0 : -1;

		client.matchPatternsInDocument(document, patterns).then(result => {
			if (!vscode.window.activeTextEditor
				|| document.version !== version
				|| vscode.window.activeTextEditor?.document != document
			) {
				return;
			}
			if (result.message) {
				// @todo: show the message.
				return;
			}
			const byCategory: Map<string, PatternMatch[]> | undefined = result && new Map();
			result?.patternMatches.forEach((m, i) => {
				const category = extractedPatterns[i].category;
				const matches = byCategory.get(category) || [];
				matches.push(m);
				byCategory.set(category, matches);
			})

			outline.refresh(byCategory);
			const activeEditor = vscode.window.activeTextEditor;
			const flattenResults = result.patternMatches
				.filter((_, i) => i === highlightIndex)
				.filter(patternMatch => patternMatch.regexp === pattern || patternMatch.name === pattern)
				.map(patternMatch => patternMatch.matches.map(range => ({ range, message: createHoverMessage(patternMatch) })))
				.reduce((a, v) => a.concat(v), []);
			const decorations: vscode.DecorationOptions[] = flattenResults.map(match => {
				const { range, message } = match;
				const startPos = activeEditor.document.positionAt(range[0]);
				const endPos = activeEditor.document.positionAt(range[1]);
				const decoration: vscode.DecorationOptions = { range: new vscode.Range(startPos, endPos), hoverMessage: message };
				return decoration;
			});
			activeEditor.setDecorations(decorationTypeExclude, decorations);
		});
	}

	function clearDecorations() {
		activeEditor?.setDecorations(decorationTypeExclude, []);
	}

	function createHoverMessage(match: PatternMatch) {
		const r = (new vscode.MarkdownString())
			.appendText(match.name + ' ' + match.elapsedTime.toFixed(2) + 'ms');
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

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (isActive) {
			activeEditor = editor;
			if (editor) {
				triggerUpdateDecorations();
			}
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (isActive && activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	function disposeCurrent() {
		// current?.execResult?.dispose();
	}

	function userTestRegExp(defaultRegexp?: string) {
		function validateInput(input: string) {
			try {
				toRegExp(input, 'g');
			} catch (e) {
				return e.toString();
			}
		}
		pattern = defaultRegexp || pattern;
		vscode.window.showInputBox({
			prompt: 'Enter a Regular Expression',
			placeHolder: 'Example: /\b\w+/g',
			value: pattern?.toString(),
			validateInput
		}).then(value => {
			pattern = value ? value : undefined;
			updateHistory(pattern);
			triggerUpdateDecorations();
		});
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
			userTestRegExp(item.treeItem.pattern.regexp);
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

	function dispose() {
		disposeCurrent();
		for (const d of disposables) {
			d.dispose();
		}
		disposables.clear();
	}

    context.subscriptions.push(
		{dispose},
        vscode.commands.registerCommand('cSpellRegExpTester.testRegExp', userTestRegExp),
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

	userPatterns.forEach(p => extractedPatterns.push({ category: 'User Patterns', pattern: p }));
	config?.includeRegExpList?.forEach(p => extractedPatterns.push({ category: 'Include Regexp List', pattern: p.toString()}));
	config?.ignoreRegExpList?.forEach(p => extractedPatterns.push({ category: 'Exclude Regexp List', pattern: p.toString()}));
	config?.patterns?.forEach(p => extractedPatterns.push({ category: 'Patterns', pattern: {
		name: p.name,
		regexp: p.pattern.toString(),
	}}));
	return extractedPatterns;
}

function fetchIsEnabledFromConfig(): boolean {
	const cfg = vscode.workspace.getConfiguration('cSpell');
	return !!cfg?.get('experimental.enableRegexpView');
}
