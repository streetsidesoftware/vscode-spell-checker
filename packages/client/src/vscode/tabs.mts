import type { Tab, Uri } from 'vscode';
import { window } from 'vscode';

import { isUriResource } from './isUriResource.mjs';

interface TabUri {
    label: string;
    uri: Uri;
    tab: Tab;
}
export function findTabsWithUriInput(): TabUri[] {
    const tabs: TabUri[] = [];

    for (const tg of window.tabGroups.all) {
        for (const tab of tg.tabs) {
            const { label, input } = tab;
            if (hasUri(input)) {
                tabs.push({ tab, label, uri: input.uri });
            }
        }
    }
    return tabs;
}
function hasUri<T extends { uri: Uri }>(v: T | unknown): v is T {
    if (!v || typeof v !== 'object') return false;
    return 'uri' in v;
}

export function extractUrisFromTabs(): Uri[] {
    return window.tabGroups.all
        .flatMap((tabGroup) => tabGroup.tabs)
        .map((tab) => tab.input)
        .filter(isUriResource)
        .map((r) => r.uri);
}

export function findAllOpenUrisInTabs(): Uri[] {
    return extractUrisFromTabs();
}

export function isUriInAnyTab(uri: Uri | string): boolean {
    const sUri = uri.toString();
    const tabs = findTabsWithUriInput();
    return tabs.some((tab) => tab.uri.toString() === sUri);
}
