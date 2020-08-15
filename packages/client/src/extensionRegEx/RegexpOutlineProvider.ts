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
        treeItem.description = offset.elapsedTime.toFixed(2) + 'ms' + (offset.message ? ' ' + offset.message : '');
		return treeItem;
	}
}
