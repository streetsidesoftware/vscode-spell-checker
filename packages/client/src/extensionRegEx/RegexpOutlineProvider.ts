import * as vscode from 'vscode';

import type { PatternMatch } from './server';
export class RegexpOutlineProvider implements vscode.TreeDataProvider<OutlineItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<OutlineItem | undefined> = new vscode.EventEmitter<OutlineItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<OutlineItem | undefined> = this._onDidChangeTreeData.event;

    private outline: OutlineItem | undefined;

    refresh(data?: PatternMatchByCategory): void {
        this.outline = data ? createOutlineItems(data) : undefined;
        this._onDidChangeTreeData.fire(undefined);
    }

    getChildren(offset?: OutlineItem): Thenable<OutlineItem[] | undefined> {
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
    root.children = [...data.entries()].map((e) => createCategoryItem(root, ...e));
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

interface PatternOutlineItem extends OutlineItem {
    treeItem: RegexpOutlineItem;
}

function createLeaf(pattern: PatternMatch): OutlineItem {
    const treeItem = new RegexpOutlineItem(pattern);
    const item: PatternOutlineItem = {
        treeItem,
    };
    item.children = createChildren(item);

    return item;
}

function trimName(name: string) {
    const maxLen = 50;
    if (name.length <= maxLen) {
        return name;
    }
    return name.substr(0, maxLen - 1) + '…';
}

function createChildren(parent: PatternOutlineItem): OutlineItem[] | undefined {
    const pattern = parent.treeItem.pattern;
    if (pattern.defs.length < 2) {
        return undefined;
    }
    const name = pattern.name;
    return pattern.defs.map((d, i) => ({ name: `${name}.${i}`, defs: [d] })).map(createLeaf);
}

export class RegexpOutlineItem extends vscode.TreeItem {
    // public pattern: PatternMatch;

    constructor(public pattern: PatternMatch) {
        super(
            trimName(pattern.name),
            pattern.defs.length > 1 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None,
        );
        this.pattern = pattern;
        const { timeMs, errorMsg, toolTip, count } = extractInfo(pattern);
        const msg = errorMsg ? ' ' + errorMsg : '';
        const parts = [`${timeMs}ms`, `(${count})`, msg].filter((a) => !!a);
        this.description = parts.join(' ');
        this.tooltip = toolTip;
        this.command = {
            command: 'cSpellRegExpTester.selectRegExp',
            arguments: [pattern.defs[0]?.regexp],
            title: 'Select RegExp',
        };
        this.contextValue = 'regexp';
    }
}

function extractInfo(p: PatternMatch) {
    const timeMs = p.defs
        .map((m) => m.elapsedTime)
        .reduce((a, b) => a + b, 0)
        .toFixed(2);
    const errorMsg = p.defs
        .map((m) => m.errorMessage)
        .filter((m) => !!m)
        .join(', ');
    const regexps = p.defs.map((m) => m.regexp.toString());
    const toolTip = regexps.length > 1 ? 'Multi Pattern' : regexps.join('');
    const count = p.defs.map((m) => m.matches.length).reduce((a, b) => a + b, 0);

    return {
        timeMs,
        errorMsg,
        toolTip,
        count,
    };
}
