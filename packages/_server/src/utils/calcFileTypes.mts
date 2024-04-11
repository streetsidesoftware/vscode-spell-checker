import { getLanguageIdsForBaseFilename } from 'cspell-lib';
import type { URI } from 'vscode-uri';

import { basename } from './basename.mjs';

export function calcFileTypes(url: string | URI | URL): string[] {
    return getLanguageIdsForBaseFilename(basename(url));
}
