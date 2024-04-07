import { createTextDocument, DocumentValidator } from 'cspell-lib';
import { DisposableList } from 'utils-disposables';
import type { TextDocumentChangeEvent, TextDocuments } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';

import type { TextDocumentInfoWithText, TextDocumentRef } from './api.js';
import type { CSpellUserSettings } from './config/cspellConfig/index.mjs';
import type { DocumentSettings } from './config/documentSettings.mjs';
import { defaultCheckLimit } from './constants.mjs';
import { breakTextAtLimit } from './utils/breakTextAtLimit.mjs';

interface DocValEntry {
    uri: string;
    settings: Promise<CSpellUserSettings>;
    docVal: Promise<DocumentValidator>;
}

export class DocumentValidationController {
    private docValMap = new Map<string, DocValEntry>();
    private disposables = new DisposableList();

    constructor(
        readonly documentSettings: DocumentSettings,
        readonly documents: TextDocuments<TextDocument>,
    ) {
        this.disposables.push(
            documents.onDidClose((e) => this.handleOnDidClose(e)),
            documents.onDidChangeContent((e) => this.handleOnDidChangeContent(e)),
        );
    }

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
        this.disposables.dispose();
    }

    private handleOnDidClose(e: TextDocumentChangeEvent<TextDocument>) {
        this.docValMap.delete(e.document.uri);
    }

    private handleOnDidChangeContent(e: TextDocumentChangeEvent<TextDocument>) {
        this._handleOnDidChangeContent(e).catch(() => undefined);
    }

    private async _handleOnDidChangeContent(e: TextDocumentChangeEvent<TextDocument>) {
        const { document } = e;
        const entry = this.docValMap.get(document.uri);
        if (!entry) return;
        const { settings, docVal } = entry;
        const updatedSettings = await this.documentSettings.getSettings(document);
        const [_settings, _docVal, _curSettings] = await Promise.all([settings, docVal, updatedSettings] as const);
        if (_settings !== _curSettings) {
            this.docValMap.set(document.uri, this.createDocValEntry(document));
            return;
        }
        await _docVal.updateDocumentText(document.getText());
    }
}

export async function createDocumentValidator(
    textDocument: TextDocument | TextDocumentInfoWithText,
    pSettings: Promise<CSpellUserSettings> | CSpellUserSettings,
): Promise<DocumentValidator> {
    const settings = await pSettings;
    const limit = (settings.checkLimit || defaultCheckLimit) * 1024;
    const fullContent = 'getText' in textDocument ? textDocument.getText() : textDocument.text;
    const content = breakTextAtLimit(fullContent, limit);
    const { uri, languageId, version } = textDocument;
    const docInfo = { uri, content, languageId, version };
    const doc = createTextDocument(docInfo);
    const docVal = new DocumentValidator(doc, { noConfigSearch: true }, settings);
    await docVal.prepare();
    return docVal;
}
