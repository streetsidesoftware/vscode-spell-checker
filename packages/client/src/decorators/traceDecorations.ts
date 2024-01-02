import { createDisposableList } from 'utils-disposables';
import type { TextEditorDecorationType } from 'vscode';
import vscode from 'vscode';

import type { CSpellClient } from '../client';
import type { Disposable } from '../disposable';
import { createEmitter, map, pipe, throttle } from '../Subscribables';
import { logError } from '../util/errors';

const ignoreSchemes: Record<string, boolean> = {
    output: true,
};

export class SpellingExclusionsDecorator implements Disposable {
    private decorationType: TextEditorDecorationType | undefined;
    private disposables = createDisposableList();
    public dispose = this.disposables.dispose;
    private eventEmitter = createEmitter<vscode.TextEditor | undefined>();
    private _enabled = false;
    private _pendingUpdates = new Set<vscode.TextEditor>();

    constructor(
        readonly context: vscode.ExtensionContext,
        readonly client: CSpellClient,
    ) {
        this.enabled = context.globalState.get(SpellingExclusionsDecorator.globalStateKey, false);
        this.disposables.push(
            () => this.clearDecoration(),
            vscode.window.onDidChangeActiveTextEditor((e) => this.refreshEditor(e)),
            vscode.workspace.onDidChangeConfiguration((e) => e.affectsConfiguration('cSpell') && this.refreshEditor(undefined)),
            vscode.workspace.onDidChangeTextDocument((e) => this.refreshDocument(e.document)),
            vscode.languages.registerHoverProvider('*', this.getHoverProvider()),
            pipe(
                this.eventEmitter,
                map((e) => (e && this._pendingUpdates.add(e), e)),
                throttle(100),
            ).subscribe(() => this.handlePendingUpdates()),
        );
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this.context.globalState.update(SpellingExclusionsDecorator.globalStateKey, this.enabled);
        // console.error('globalState.keys %o', this.context.globalState.keys());
        if (this._enabled === value) return;
        this._enabled = value;
        this.resetDecorator();
    }

    toggleEnabled() {
        this.enabled = !this.enabled;
    }

    private refreshEditor(editor?: vscode.TextEditor | undefined) {
        editor ??= vscode.window.activeTextEditor;
        if (!editor) return;
        this.eventEmitter.notify(editor);
    }

    private refreshDocument(doc: vscode.TextDocument) {
        if (!this.enabled) return;
        const editor = vscode.window.visibleTextEditors.find((e) => e.document === doc);
        if (!editor) return;
        this.refreshEditor(editor);
    }

    private clearDecoration() {
        this.decorationType?.dispose();
        this.decorationType = undefined;
    }

    private resetDecorator() {
        this.clearDecoration();
        if (!this.enabled) return;
        this.createDecorator();
        this.refreshEditor();
    }

    private createDecorator() {
        this.decorationType?.dispose();
        this.decorationType = vscode.window.createTextEditorDecorationType({
            light: {
                // this color will be used in light color themes
                backgroundColor: '#8884',
            },
            dark: {
                // this color will be used in dark color themes
                backgroundColor: '#8884',
            },
        });
    }

    private async getOffsets(editor: vscode.TextEditor | undefined): Promise<number[]> {
        const doc = editor?.document;
        if (!doc) return [];
        if (doc.uri.scheme in ignoreSchemes) return [];
        const exclusions = await this.client.serverApi.getSpellCheckingOffsets({ uri: doc.uri.toString() });
        return exclusions.offsets;
    }

    private handlePendingUpdates() {
        const editors = [...this._pendingUpdates];
        this._pendingUpdates.clear();
        for (const editor of editors) {
            this.updateDecorations(editor);
        }
    }

    private async updateDecorations(editor: vscode.TextEditor | undefined) {
        if (!this.decorationType || !editor) return;
        const hoverMessage = new vscode.MarkdownString('Excluded from spell checking');
        try {
            const doc = editor.document;
            const decorations: vscode.DecorationOptions[] = [];
            const offsets = await this.getOffsets(editor);
            if (offsets.length < 2) return;
            let lastPos = 0;
            for (let i = 0; i < offsets.length - 1; i += 2) {
                const end = offsets[i];
                if (end <= lastPos) {
                    lastPos = offsets[i + 1];
                    continue;
                }
                const range = new vscode.Range(doc.positionAt(lastPos), doc.positionAt(end));
                decorations.push({ range, hoverMessage });
                lastPos = offsets[i + 1];
            }
            const textLen = doc.getText().length;
            if (lastPos < textLen) {
                const range = new vscode.Range(doc.positionAt(lastPos), doc.positionAt(textLen));
                decorations.push({ range });
            }
            editor.setDecorations(this.decorationType, decorations);
        } catch (err) {
            editor.setDecorations(this.decorationType, []);
            logError(err, 'Failed to update decorations');
        }
    }

    private getHoverProvider(): vscode.HoverProvider {
        return {
            provideHover: async (doc, pos) => {
                if (!this.enabled) return undefined;
                if (doc.uri.scheme in ignoreSchemes) return undefined;
                const range = doc.getWordRangeAtPosition(pos);
                if (!range) return undefined;
                const word = doc.getText(range);
                const traceResult = await this.client.serverApi.traceWord({ uri: doc.uri.toString(), word });
                const hoverMessage = new vscode.MarkdownString();
                hoverMessage.appendMarkdown('### Trace:\n');
                hoverMessage.isTrusted = true;
                hoverMessage.baseUri = doc.uri;
                hoverMessage.supportThemeIcons = true;
                if (traceResult.errors) {
                    hoverMessage.appendMarkdown('**Errors:** ').appendText(traceResult.errors + '\n');
                }
                if (traceResult.traces) {
                    for (const wordTrace of traceResult.traces) {
                        const found = wordTrace.traces.filter((t) => t.found);
                        const word = wordTrace.word;
                        hoverMessage.appendMarkdown(`**\`${word.replace(/`/g, "'")}\`:** ${wordTrace.found ? 'Found' : 'Not Found'}\n`);

                        for (const trace of found) {
                            if (isUrlLike(trace.dictSource || '') && !trace.dictSource.includes('node_modules')) {
                                hoverMessage
                                    .appendMarkdown('- $(book) [')
                                    .appendText(trace.dictName)
                                    .appendMarkdown('](')
                                    .appendText(trace.dictSource)
                                    .appendMarkdown(')');
                            } else {
                                hoverMessage.appendMarkdown('- $(book) _').appendText(trace.dictName).appendMarkdown('_');
                            }
                            if (trace.foundWord && trace.foundWord !== word) {
                                hoverMessage.appendMarkdown(' **').appendText(trace.foundWord.trim()).appendMarkdown('**');
                            }
                            hoverMessage.appendMarkdown('\n');
                        }
                        hoverMessage.appendMarkdown('\n');
                    }
                }
                hoverMessage.appendMarkdown('\n[Disable Trace Mode](command:cSpell.toggleTraceMode)');
                const hover = new vscode.Hover(hoverMessage, range);
                return hover;
            },
        };
    }

    static globalStateKey = 'showTrace';
}

const regExpUri = /^([a-z-]{2,}):\/\//i;

function isUrlLike(uri: string): boolean {
    return regExpUri.test(uri);
}
