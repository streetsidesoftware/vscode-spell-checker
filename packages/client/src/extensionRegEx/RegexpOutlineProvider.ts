import * as vscode from 'vscode';
import { MatchPatternsToDocumentResult, PatternMatch } from '../server';

export class RegexpOutlineProvider implements vscode.TreeDataProvider<OutlineItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<OutlineItem | undefined> = new vscode.EventEmitter<OutlineItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<OutlineItem | undefined> = this._onDidChangeTreeData.event;

    private outline: OutlineItem | undefined;

	constructor() {}

	refresh(data?: PatternMatchByCategory): void {
        this.outline = data ? createOutlineItems(data) : undefined;
        this._onDidChangeTreeData.fire(undefined);
	}

	getChildren(offset?: OutlineItem): Thenable<OutlineItem[]> {
		if (offset) {
			return Promise.resolve(offset.children);
		} else {
			return Promise.resolve(this.outline?.children);
		}
	}

	getTreeItem(offset: OutlineItem): vscode.TreeItem {
		return offset.treeItem;
	}
}

interface OutlineItem {
	treeItem: vscode.TreeItem;
	children?: OutlineItem[];
}

export type PatternMatchByCategory = Map<string, PatternMatch[]>;

function createOutlineItems(data: PatternMatchByCategory): OutlineItem {
	const root: OutlineItem = {
		treeItem: new vscode.TreeItem('root', vscode.TreeItemCollapsibleState.Expanded),
		children: [...data.entries()].map(e => createCategoryItem(...e)),
	};
	return root;
}

function createCategoryItem(category: string, matches: PatternMatch[]): OutlineItem {
	const item: OutlineItem = {
		treeItem: new vscode.TreeItem(category, vscode.TreeItemCollapsibleState.Expanded),
		children: matches.map(createLeaf),
	};
	return item;
}

function createLeaf(offset: PatternMatch): OutlineItem {
	const treeItem = new vscode.TreeItem(offset.name);
	const timeMs = offset.elapsedTime.toFixed(2);
	const msg = offset.message ? ' ' + offset.message : ''
	const parts = [
		`${timeMs}ms`,
		`(${offset.matches.length})`,
		msg,
	].filter(a => !!a);
	treeItem.description = parts.join(' ');
	treeItem.tooltip = offset.regexp
	treeItem.command = {
		command: 'cSpellRegExpTester.selectRegExp',
		arguments: [offset.regexp],
		title: 'Select RegExp'
	}

	const item: OutlineItem = {
		treeItem,
	};

	return item;
}
