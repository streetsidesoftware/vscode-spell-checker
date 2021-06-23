import { TextDocument } from 'vscode-languageserver-textdocument';
import { OnSpellCheckDocumentStep } from './api';
import { Connection } from 'vscode-languageserver/node';
import { createClientNotificationApi } from './clientNotificationApi';

let seq = 0;

export interface ProgressNotifier {
    emitSpellCheckDocumentStep: (doc: TextDocument, step: string, numIssues?: number) => void;
}

export function createProgressNotifier(connection: Connection): ProgressNotifier {
    const api = createClientNotificationApi(connection);

    return {
        emitSpellCheckDocumentStep: (doc, step, numIssues) => api.onSpellCheckDocument(toOnSpellCheckDocumentStep(doc, step, numIssues)),
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
