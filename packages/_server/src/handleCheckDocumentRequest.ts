import type { CSpellSettings } from 'cspell-lib';
import type { TextDocument } from 'vscode-languageserver-textdocument';

import type * as Api from './api.js';
import type { DocumentValidationController } from './DocumentValidationController.mjs';
import { readTextDocument } from './vfs/index.mjs';
import { toTextDocument } from './vfs/readTextDocument.mjs';

export async function handleCheckDocumentRequest(
    docValidationController: DocumentValidationController,
    docRef: Api.TextDocumentInfo,
    options: Api.CheckDocumentOptions,
    getCachedDoc: (uri: string) => TextDocument | undefined,
    shouldCheck: (doc: Api.TextDocumentInfo, settings: CSpellSettings) => boolean | Promise<boolean>,
): Promise<Api.CheckDocumentResult> {
    const { uri } = docRef;
    const checkSettings = !options.forceCheck && (await docValidationController.documentSettings.getSettings(docRef));
    if (checkSettings && !(await shouldCheck(docRef, checkSettings))) {
        return { uri, skipped: true };
    }
    const doc = await getDoc();
    if (!doc) return { uri, errors: 'Document Not Found.' };

    const docVal = await docValidationController.getDocumentValidator(doc, false);

    if (!docVal.getFinalizedDocSettings().enabled && !options.forceCheck) {
        return { uri, skipped: true };
    }

    const results = docVal.checkDocument(options.forceCheck);

    const issues: Api.CheckDocumentIssue[] = results.map((issue) => ({
        text: issue.text,
        range: { start: doc.positionAt(issue.offset), end: doc.positionAt(issue.offset + (issue.length || issue.text.length)) },
        suggestions: issue.suggestionsEx,
        message: issue.message,
    }));

    return { uri, issues };

    async function getDoc() {
        if (docRef.text) {
            const text = docRef.text;
            return toTextDocument({ ...docRef, text });
        }
        let doc = getCachedDoc(docRef.uri);
        if (!doc) {
            try {
                return await readTextDocument(docRef.uri, docRef.languageId);
            } catch {
                doc = undefined;
            }
        }
        return doc;
    }
}
