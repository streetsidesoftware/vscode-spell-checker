import { createTextDocument, DocumentValidator } from 'cspell-lib';
import type { TextDocument } from 'vscode-languageserver-textdocument';

import type { TextDocumentInfoWithText, TextDocumentRef } from './api.js';
import type { CSpellUserSettings } from './config/cspellConfig/index.mjs';
import type { DocumentSettings } from './config/documentSettings.mjs';
import { defaultCheckLimit } from './constants.mjs';

interface DocValEntry {
    uri: string;
    settings: Promise<CSpellUserSettings>;
    docVal: Promise<DocumentValidator>;
}

export class DocumentValidationController {
    private docValMap = new Map<string, DocValEntry>();

    constructor(readonly documentSettings: DocumentSettings) {}

    get(doc: TextDocumentRef) {
        return this.docValMap.get(doc.uri);
    }

    getDocumentValidator(docInfo: TextDocumentInfoWithText | TextDocument) {
        const uri = docInfo.uri;
        const docValEntry = this.docValMap.get(uri);
        if (docValEntry) return docValEntry.docVal;

        const entry = this.createDocValEntry(docInfo);
        this.docValMap.set(uri, entry);
        return entry.docVal;
    }

    private createDocValEntry(docInfo: TextDocumentInfoWithText | TextDocument) {
        const uri = docInfo.uri;
        const settings = this.documentSettings.getSettings(docInfo);
        const docVal = createDocumentValidator(docInfo, settings);
        const entry: DocValEntry = { uri, settings, docVal };
        return entry;
    }

    clear() {
        this.docValMap.clear();
    }

    dispose() {
        this.clear();
    }
}

export async function createDocumentValidator(
    textDocument: TextDocument | TextDocumentInfoWithText,
    pSettings: Promise<CSpellUserSettings> | CSpellUserSettings,
): Promise<DocumentValidator> {
    const settings = await pSettings;
    const limit = (settings.checkLimit || defaultCheckLimit) * 1024;
    const content = ('getText' in textDocument ? textDocument.getText() : textDocument.text).slice(0, limit);
    const { uri, languageId, version } = textDocument;
    const docInfo = { uri, content, languageId, version };
    const doc = createTextDocument(docInfo);
    const docVal = new DocumentValidator(doc, { noConfigSearch: true }, settings);
    await docVal.prepare();
    return docVal;
}
