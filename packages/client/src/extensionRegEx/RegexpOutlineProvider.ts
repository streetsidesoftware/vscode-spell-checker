import * as vscode from 'vscode';
import { MatchPatternsToDocumentResult, PatternMatch } from '../server';

export class RegexpOutlineProvider implements vscode.TreeDataProvider<PatternMatch> {

	private _onDidChangeTreeData: vscode.EventEmitter<PatternMatch | undefined> = new vscode.EventEmitter<PatternMatch | undefined>();
	readonly onDidChangeTreeData: vscode.Event<PatternMatch | undefined> = this._onDidChangeTreeData.event;

    private data: MatchPatternsToDocumentResult | undefined;

	constructor() {}

	refresh(data?: MatchPatternsToDocumentResult): void {
        this.data = data;
        this._onDidChangeTreeData.fire(undefined);
	}

	getChildren(offset?: PatternMatch): Thenable<PatternMatch[]> {
		if (offset) {
			return Promise.resolve([]);
		} else {
			return Promise.resolve(this.data?.patternMatches);
		}
	}

	getTreeItem(offset: PatternMatch): vscode.TreeItem {
		const treeItem = new vscode.TreeItem(offset.name);
		const timeMs = offset.elapsedTime.toFixed(2);
		const msg = offset.message ? ' ' + offset.message : ''
		const parts = [
			`${timeMs}ms`,
			`(${offset.matches.length})`,
			msg,
		].filter(a => !!a);
        treeItem.description = parts.join(' ');
		return treeItem;
	}
}
