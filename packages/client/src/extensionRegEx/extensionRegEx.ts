import * as vscode from 'vscode';
import { CSpellClient } from '../client';
import { PatternMatch, CSpellUserSettings, NamedPattern } from '../server';
import { toRegExp } from './evaluateRegExp';
import { RegexpOutlineProvider } from './RegexpOutlineProvider';

interface DisposableLike {
	dispose(): any;
}

interface InProgress {
	activeEditor: vscode.TextEditor;
	document: vscode.TextDocument;
	version: number;
}

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext, client: CSpellClient) {

    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

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

	let activeEditor = vscode.window.activeTextEditor;
	let pattern: string | undefined = '/\\w+/';

	let isActive = fetchIsEnabledFromConfig();

	async function updateDecorations() {
		disposeCurrent();
		if (!isActive) {
			activeEditor?.setDecorations(decorationTypeExclude, []);
			statusBar.hide();
			return;
		}

		if (!activeEditor) {
			return;
		}
		if (!pattern) {
			activeEditor.setDecorations(decorationTypeExclude, []);
			statusBar.hide();
			return;
		}
		const document = activeEditor.document;
		const version = document.version;
		const config = await client.getConfigurationForDocument(document);
		const extractedPatterns = extractPatternsFromConfig(config.docSettings, [pattern]);
		const patterns = extractedPatterns.map(p => p.pattern);

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
			const processingTimeMs = result.patternMatches.map(m => m.elapsedTime).reduce((a, b) => a + b, 0);
			const patternCount = result.patternMatches.map(m => m.matches.length > 0 ? 1 : 0).reduce((a, b) => a + b, 0);
			const failedCount = result.patternMatches.map(m => m.message ? 1 : 0).reduce((a, b) => a + b, 0);
			const flattenResults = result.patternMatches
				.filter(patternMatch => patternMatch.regexp === pattern)
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
			updateStatusBar(`Patterns: ${patternCount} | ${failedCount}`, result ? { elapsedTime: processingTimeMs, count: flattenResults.length } : undefined);
		});
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
		updateStatusBar(pattern);
		timeout = setTimeout(updateDecorations, 100);
	}

	interface StatusBarInfo {
		elapsedTime: number;
		count: number;
	}

	function updateStatusBar(pattern: string | undefined, info?: StatusBarInfo) {
		if (pattern) {
			const { elapsedTime, count = 0 } = info || {};
			const time = elapsedTime ? `${elapsedTime.toFixed(2)}ms` : '$(clock)';
			statusBar.text = `${time} | ${pattern}`;
			statusBar.tooltip = elapsedTime ? 'Regular Expression Test Results, found ' + count : 'Running Regular Expression Test';
			statusBar.command = 'cSpellRegExpTester.testRegExp';
			statusBar.show();
		} else {
			statusBar.hide();
		}
	}

	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
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
			if (!value) {
				pattern = undefined;
				triggerUpdateDecorations();
				return;
			}
			try {
				pattern = value;
			} catch (e) {
				vscode.window.showWarningMessage(e.toString());
				pattern = undefined;
			}
			triggerUpdateDecorations();
		});
	}

	function userSelectRegExp(selectedRegExp?: string) {
		if (pattern === selectedRegExp) {
			pattern = undefined;
		} else {
			pattern = selectedRegExp;
		}
		triggerUpdateDecorations();
	}

	function updateIsActive() {
		isActive = fetchIsEnabledFromConfig();
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
		statusBar,
        vscode.commands.registerCommand('cSpellRegExpTester.testRegExp', userTestRegExp),
		vscode.commands.registerCommand('cSpellRegExpTester.selectRegExp', userSelectRegExp),
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
	return !!cfg && !!cfg.get('experimental.enableRegexpView');
}
