import type { TextDocument } from 'vscode-languageserver-textdocument';

import type * as Api from './api.js';
import type { DocumentValidationController } from './DocumentValidationController.mjs';
import { groupByField } from './utils/groupByField.js';

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

function errorsToString(errors: Error[] | undefined): string | undefined {
    if (!errors || !errors.length) return undefined;
    return errors.map((e) => e.message).join('\n');
}

function isFound(traces: { found: boolean }[]): boolean {
    return traces.some((t) => t.found);
}
