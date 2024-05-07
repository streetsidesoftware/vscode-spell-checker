import { createDisposableList } from 'utils-disposables';
import type { Disposable } from 'vscode';
import vscode from 'vscode';

const showLanguageStatus = false;

export function createLanguageStatus(): Disposable {
    const dList = createDisposableList();
    if (!showLanguageStatus) return dList;

    const item = vscode.languages.createLanguageStatusItem('cspell', { language: '*' });
    item.text = '$(check) CSpell';
    item.severity = vscode.LanguageStatusSeverity.Information;
    // item.command = 'cspell.showOutput';
    item.detail = '$(gear~spin) CSpell is **`active`**';

    dList.push(item);

    return dList;
}
