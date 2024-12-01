import type { Uri } from 'vscode';

import { createIsUriVisibleFilter } from '../vscode/createIsUriVisibleFilter.mjs';

export function createIsItemVisibleFilter<T extends { uri: Uri }>(onlyVisible: boolean): (item: T) => boolean {
    const filter = createIsUriVisibleFilter(onlyVisible);
    return (item: T) => filter(item.uri);
}
