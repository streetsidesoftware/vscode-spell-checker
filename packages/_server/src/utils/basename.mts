import type { URI } from 'vscode-uri';

import { toUrl } from './toUrl.mjs';

/**
 * Get the basename of a URL
 * @param url - the url to get the basename of
 * @returns the basename of the url
 */
export function basename(url: string | URI | URL): string {
    const u = toUrl(url);
    return u.pathname.split('/').pop() || '';
}
