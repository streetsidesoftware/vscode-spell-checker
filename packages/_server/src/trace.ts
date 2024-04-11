import { groupByField } from '@internal/common-utils';
import { TextDocument } from 'vscode-languageserver-textdocument';

import type * as Api from './api.js';
import type { DocumentValidationController } from './DocumentValidationController.mjs';
import { readTextDocument, stat } from './vfs/index.mjs';

export async function traceWord(
    docValidationController: DocumentValidationController,
    doc: TextDocument,
    word: string,
): Promise<Api.TraceWordResult> {
    const docVal = await docValidationController.getDocumentValidator(doc);
    const trace = docVal.traceWord(word);

    const byWord = groupByField(trace, 'word');
    const traces = [...byWord.entries()].map(([word, traces]) => ({
        word,
        found: isFound(traces),
        traces: traces.map((t) => ({ ...t, errors: errorsToString(t.errors) })),
    }));

    const splits = trace.splits || traces.map(({ word, found }) => ({ word, found }));

    return { word, traces, splits };
}

export async function handleTraceRequest(
    docValidationController: DocumentValidationController,
    req: Api.TraceWordRequest,
    getCachedDoc: (uri: string) => TextDocument | undefined,
): Promise<Api.TraceWordResult> {
    const { word, uri } = req;
    let doc = getCachedDoc(uri);
    if (!doc) {
        try {
            const s = await stat(uri);
            doc = s.isDirectory() ? TextDocument.create(uri, 'plaintext', 0, '') : await readTextDocument(uri);
        } catch {
            doc = undefined;
        }
    }
    if (!doc) return { word, errors: 'Document Not Found.' };
    return traceWord(docValidationController, doc, word);
}

function errorsToString(errors: Error[] | undefined): string | undefined {
    if (!errors || !errors.length) return undefined;
    return errors.map((e) => e.message).join('\n');
}

function isFound(traces: { found: boolean }[]): boolean {
    return traces.some((t) => t.found);
}
