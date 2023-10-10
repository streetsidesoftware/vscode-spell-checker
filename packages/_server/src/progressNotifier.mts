import type { TextDocument } from 'vscode-languageserver-textdocument';

import type { OnSpellCheckDocumentStep, ServerSideApi } from './api.js';

let seq = 0;

export interface ProgressNotifier {
    emitSpellCheckDocumentStep: (doc: TextDocument, step: string, numIssues?: number) => void;
}

export function createProgressNotifier(clientApi: ServerSideApi): ProgressNotifier {
    return {
        emitSpellCheckDocumentStep: (doc, step, numIssues) =>
            clientApi.clientNotification.onSpellCheckDocument(toOnSpellCheckDocumentStep(doc, step, numIssues)),
    };
}

function toOnSpellCheckDocumentStep(doc: TextDocument, step: string, numIssues: number | undefined): OnSpellCheckDocumentStep {
    return {
        uri: doc.uri,
        version: doc.version,
        step,
        seq: ++seq,
        ts: Date.now(),
        numIssues,
        done: numIssues !== undefined,
    };
}
