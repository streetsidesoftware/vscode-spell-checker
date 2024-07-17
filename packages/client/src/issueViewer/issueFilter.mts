import type { Uri } from 'vscode';
import { window } from 'vscode';

export function createIsItemVisibleFilter<T extends { uri: Uri }>(onlyVisible: boolean): (item: T) => boolean {
    const filter = createIsUriVisibleFilter(onlyVisible);
    return (item: T) => filter(item.uri);
}

export function createIsUriVisibleFilter(onlyVisible: boolean): (uri: Uri) => boolean {
    if (!onlyVisible) return () => true;
    // Use the path to avoid scheme issues.
    const visibleEditorPaths = new Set(window.visibleTextEditors.map((e) => e.document.uri.path));
    return (uri: Uri) => visibleEditorPaths.has(uri.path);
}
