import { type Uri, window } from 'vscode';

import { findTabsWithUriInput } from './tabs.mjs';

export function createIsUriVisibleFilter(onlyVisible: boolean): (uri: Uri) => boolean {
    if (!onlyVisible) return () => true;
    // Use the path to avoid scheme issues.
    const tabs = findTabsWithUriInput();

    const visibleUris = new Set([
        ...tabs.map((tab) => tab.uri.toString()),
        ...window.visibleTextEditors.map((e) => e.document.uri.toString()),
    ]);
    return (uri: Uri) => {
        const h = visibleUris.has(uri.toString());
        // console.log('isUriVisible', uri.toString(), h);
        return h;
    };
}
