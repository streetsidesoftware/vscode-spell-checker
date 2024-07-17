import type { Uri } from 'vscode';
import { window } from 'vscode';

export function createIsItemVisibleFilter<T extends { uri: Uri }>(onlyVisible: boolean): (item: T) => boolean {
    const filter = createIsUriVisibleFilter(onlyVisible);
    return (item: T) => filter(item.uri);
}

export function createIsUriVisibleFilter(onlyVisible: boolean): (uri: Uri) => boolean {
    if (!onlyVisible) return () => true;
    // Use the path to avoid scheme issues.
    const tabs = extractUrisFromTabs();

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

interface TabUri {
    label: string;
    uri: Uri;
}

function extractUrisFromTabs(): TabUri[] {
    const tabs: TabUri[] = [];

    for (const tg of window.tabGroups.all) {
        for (const tab of tg.tabs) {
            const { label, input } = tab;
            if (hasUri(input)) {
                tabs.push({ label, uri: input.uri });
            }
        }
    }
    return tabs;
}

function hasUri<T extends { uri: Uri }>(v: T | unknown): v is T {
    if (!v || typeof v !== 'object') return false;
    return 'uri' in v;
}
