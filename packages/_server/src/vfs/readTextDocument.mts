import { TextDocument } from 'vscode-languageserver-textdocument';
import type { URI } from 'vscode-uri';

import type { TextDocumentInfoWithText } from '../api.js';
import { calcFileTypes } from '../utils/calcFileTypes.mjs';
import { readTextFile } from './vfs.mjs';

export async function readTextDocument(url: string | URI | URL, filetype?: string): Promise<TextDocument> {
    const text = await readTextFile(url);
    return toTextDocument({ uri: url.toString(), text: text, languageId: filetype });
}

export function toTextDocument(doc: TextDocumentInfoWithText): TextDocument {
    const fileTypes = (!doc.languageId && calcFileTypes(doc.uri)) || [];
    return TextDocument.create(doc.uri, doc.languageId || fileTypes[0] || 'plaintext', doc.version || 0, doc.text);
}
