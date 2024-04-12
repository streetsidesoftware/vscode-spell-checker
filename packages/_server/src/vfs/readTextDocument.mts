import { TextDocument } from 'vscode-languageserver-textdocument';
import type { URI } from 'vscode-uri';

import { calcFileTypes } from '../utils/calcFileTypes.mjs';
import { readTextFile } from './vfs.mjs';

export async function readTextDocument(url: string | URI | URL, filetype?: string): Promise<TextDocument> {
    const content = await readTextFile(url);
    const fileTypes = calcFileTypes(url);
    return TextDocument.create(url.toString(), filetype || fileTypes[0] || 'plaintext', 0, content);
}
