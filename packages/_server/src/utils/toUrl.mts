import type { URI } from 'vscode-uri';

export function toUrl(url: URL | URI | string): URL {
    if (typeof url === 'string') {
        return new URL(url);
    }
    if (url instanceof URL) return url;
    return new URL(url.toString());
}
