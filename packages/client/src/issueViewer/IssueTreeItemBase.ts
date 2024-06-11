import type { ProviderResult, TreeItem } from 'vscode';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class IssueTreeItemBase {
    abstract getTreeItem(): TreeItem | Promise<TreeItem>;
    abstract getChildren(): ProviderResult<IssueTreeItemBase[]>;
    abstract getParent(): ProviderResult<IssueTreeItemBase>;
}
