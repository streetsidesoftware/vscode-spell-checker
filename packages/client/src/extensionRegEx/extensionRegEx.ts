import * as vscode from 'vscode';
import { evaluateRegExpAsync, EvaluateRegExpAsyncResult, toRegExp } from './evaluateRegExp';


interface DisposableLike {
	dispose(): any;
}

interface InProgress {
	activeEditor: vscode.TextEditor;
	document: vscode.TextDocument;
	version: number;
	execResult: ExecEvaluateRegExpResult | undefined;
}

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

	const disposables = new Set<DisposableLike>();

	console.log('decorator sample is activated');

	let timeout: NodeJS.Timer | undefined = undefined;
	let current: InProgress | undefined;

	// create a decorator type that we use to decorate small numbers
	const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
		// borderWidth: '1px',
		// borderStyle: 'solid',
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		light: {
			// this color will be used in light color themes
			// borderColor: 'darkblue',
			backgroundColor: '#C0C0FF',
		},
		dark: {
			// this color will be used in dark color themes
			// borderColor: 'lightblue',
			backgroundColor: '#347890',
		}
	});

	let activeEditor = vscode.window.activeTextEditor;
	let regEx: RegExp | undefined = /(```+)[^\1]+?\1/g;

	function updateDecorations() {
		disposeCurrent();
		if (!activeEditor) {
			return;
		}
		if (!regEx) {
			activeEditor.setDecorations(smallNumberDecorationType, []);
			statusBar.hide();
			return;
		}
		const useRegEx = regEx;
		const text = activeEditor.document.getText();
		const document = activeEditor.document;
		const execResult = execEvaluateRegExp(useRegEx, text);
		current = {
			activeEditor,
			document,
			version: document.version,
			execResult,
		};
		const localCurrent = current;

		execResult.result.then(result => {
			if (localCurrent != current
				|| vscode.window.activeTextEditor != localCurrent.activeEditor
				|| vscode.window.activeTextEditor?.document != document
				|| vscode.window.activeTextEditor?.document.version != localCurrent.version
			) {
				return;
			}
			const activeEditor = localCurrent.activeEditor;
			const decorations: vscode.DecorationOptions[] | undefined = result?.matches.map(match => {
				const startPos = activeEditor.document.positionAt(match.index);
				const endPos = activeEditor.document.positionAt(match.index + match[0].length);
				const hoverMessage = createHoverMessage(match);
				return { range: new vscode.Range(startPos, endPos), hoverMessage };
			});
			activeEditor.setDecorations(smallNumberDecorationType, decorations || []);
			updateStatusBar(useRegEx, result ? { elapsedTime: result.processingTimeMs, count: result.matches.length } : undefined);
		});
	}

	function createHoverMessage(match: RegExpExecArray) {
		const r = new vscode.MarkdownString();
		r.appendMarkdown('Match: \n\n')
		match.forEach((m, i) => {
			r.appendText(i + ': ');
			r.appendText('"' + ellipsis(m, 200) + '"');
			r.appendMarkdown('\n\n');
		})
		return r;
	}

	function ellipsis(text: string, max = 50) {
		if (text.length < max) return text;
		return text.slice(0, max - 1) + '…';
	}

	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		updateStatusBar(regEx);
		timeout = setTimeout(updateDecorations, 500);
	}

	interface StatusBarInfo {
		elapsedTime: number;
		count: number;
	}

	function updateStatusBar(regExp: RegExp | undefined, info?: StatusBarInfo) {
		if (regExp) {
			const { elapsedTime, count = 0 } = info || {};
			const time = elapsedTime ? `${elapsedTime.toFixed(2)}ms` : '$(clock)';
			statusBar.text = `${time} | ${regExp.toString()}`;
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
		current?.execResult?.dispose();
		current = undefined;
	}

	function userTestRegExp() {
		vscode.window.showInputBox({prompt: 'Enter a Regular Expression', value: regEx?.toString()}).then(value => {
			if (!value) {
				regEx = undefined;
				triggerUpdateDecorations();
				return;
			}
			try {
				regEx = toRegExp(value, 'g');
			} catch (e) {
				vscode.window.showWarningMessage(e.toString());
				regEx = undefined;
			}
			triggerUpdateDecorations();
		});
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
	);
}


interface ExecEvaluateRegExpResult {
	dispose: () => any;
	result: Promise<EvaluateRegExpAsyncResult | undefined>;
}

function execEvaluateRegExp(regExp: RegExp, text: string, limit?: number, timeLimit?: number ): ExecEvaluateRegExpResult {
	let isDisposed = false;

	async function run() {
		let result: EvaluateRegExpAsyncResult | undefined;
		if (isDisposed) return result;
		for await(result of evaluateRegExpAsync({ regExp, text, limit, processingTimeLimitMs: timeLimit })) {
			if (isDisposed) return result;
		}
		return result;
	}

	return {
		dispose: () => { isDisposed = true; },
		result: run(),
	}
}
