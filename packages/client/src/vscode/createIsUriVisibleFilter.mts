import { type Uri, window } from 'vscode';

import { findTabsWithUriInput } from './tabs.mjs';

const alwaysVisibleSchemes = new Set(['vscode-scm']);

export function createIsUriVisibleFilter(onlyVisible: boolean): (uri: Uri) => boolean {
    if (!onlyVisible) return () => true;
    // Use the path to avoid scheme issues.
    const tabs = findTabsWithUriInput();

    const visibleUris = new Set([
        ...tabs.map((tab) => tab.uri.toString()),
        ...window.visibleTextEditors.map((e) => e.document.uri.toString()),
    ]);
    return (uri: Uri) => {
        const h = visibleUris.has(uri.toString()) || alwaysVisibleSchemes.has(uri.scheme);
        // console.log('isUriVisible', uri.toString(), h);
        return h;
    };
}
