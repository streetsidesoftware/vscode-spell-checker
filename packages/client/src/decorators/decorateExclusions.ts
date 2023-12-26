import { createDisposableList } from 'utils-disposables';
import type { TextEditorDecorationType } from 'vscode';
import vscode from 'vscode';

import type { CSpellClient } from '../client';
import type { Disposable } from '../disposable';
import { createEmitter, pipe, throttle } from '../Subscribables';

export class SpellingExclusionsDecorator implements Disposable {
    private decorationType: TextEditorDecorationType | undefined;
    private disposables = createDisposableList();
    public dispose = this.disposables.dispose;
    private eventEmitter = createEmitter<vscode.TextEditor | undefined>();
    private _enabled = false;

    constructor(readonly client: CSpellClient) {
        this.disposables.push(
            () => this.clearDecoration(),
            vscode.window.onDidChangeActiveTextEditor((e) => this.refreshEditor(e)),
            vscode.workspace.onDidChangeConfiguration((e) => e.affectsConfiguration('cSpell') && this.refreshEditor(undefined)),
            vscode.workspace.onDidChangeTextDocument((e) => this.refreshDocument(e.document)),
            pipe(this.eventEmitter, throttle(100)).subscribe((e) => this.updateDecorations(e)),
        );
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(value: boolean) {
        if (this._enabled === value) return;
        this._enabled = value;
        this.resetDecorator();
    }

    toggleEnabled() {
        this.enabled = !this.enabled;
    }

    private refreshEditor(e: vscode.TextEditor | undefined) {
        e ??= vscode.window.activeTextEditor;
        if (!e) return;
        this.eventEmitter.notify(e);
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
        if (doc.uri.scheme === 'output') return [];
        const exclusions = await this.client.serverApi.getSpellCheckingOffsets({ uri: doc.uri.toString() });
        return exclusions.offsets;
    }

    private async updateDecorations(editor: vscode.TextEditor | undefined) {
        if (!this.decorationType || !editor) return;
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
                decorations.push({ range });
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
            console.error(err);
        }
    }
}
