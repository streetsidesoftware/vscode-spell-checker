import * as vscode from 'vscode';
import { PatternMatch } from '../server';

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

	getParent(offset: OutlineItem): OutlineItem | undefined {
		return offset.parent;
	}
}

interface OutlineItem {
	parent?: OutlineItem;
	treeItem: vscode.TreeItem;
	children?: OutlineItem[];
}

export type PatternMatchByCategory = Map<string, PatternMatch[]>;

function createOutlineItems(data: PatternMatchByCategory): OutlineItem {
	const root: OutlineItem = {
		treeItem: new vscode.TreeItem('root', vscode.TreeItemCollapsibleState.Expanded),
	};
	root.children = [...data.entries()].map(e => createCategoryItem(root, ...e))
	return root;
}

function createCategoryItem(parent: OutlineItem, category: string, matches: PatternMatch[]): OutlineItem {
	const item: OutlineItem = {
		parent,
		treeItem: new vscode.TreeItem(category, vscode.TreeItemCollapsibleState.Expanded),
		children: matches.map(createLeaf),
	};
	return item;
}

function createLeaf(offset: PatternMatch): OutlineItem {
	const treeItem = new RegexpOutlineItem(offset);
	const item: OutlineItem = {
		treeItem,
	};

	return item;
}

function trimName(name: string) {
	const maxLen = 50;
	if (name.length <= maxLen) {
		return name;
	}
	return name.substr(0, maxLen - 1) + '…';
}


export class RegexpOutlineItem extends vscode.TreeItem {

	// public pattern: PatternMatch;

	constructor(
		public pattern: PatternMatch
	) {
		super(trimName(pattern.name));
		this.pattern = pattern;

		const timeMs = pattern.elapsedTime.toFixed(2);
		const msg = pattern.message ? ' ' + pattern.message : ''
		const parts = [
			`${timeMs}ms`,
			`(${pattern.matches.length})`,
			msg,
		].filter(a => !!a);
		this.description = parts.join(' ');
		this.tooltip = pattern.regexp.toString();
		this.command = {
			command: 'cSpellRegExpTester.selectRegExp',
			arguments: [pattern.regexp],
			title: 'Select RegExp'
		}
		this.contextValue = 'regexp';
	}
}
