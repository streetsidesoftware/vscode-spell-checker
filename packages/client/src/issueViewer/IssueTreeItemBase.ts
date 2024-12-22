import type { ProviderResult, TreeItem } from 'vscode';

export abstract class IssueTreeItemBase {
    abstract getTreeItem(): TreeItem | Promise<TreeItem>;
    abstract getChildren(): ProviderResult<IssueTreeItemBase[]>;
    abstract getParent(): ProviderResult<IssueTreeItemBase>;
    abstract toString(): string;
}
