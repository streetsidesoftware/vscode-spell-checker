import type * as API from 'code-spell-checker-server/api';

import * as di from './di.mjs';

export type DocumentInfo = API.TextDocumentInfo;
export type CheckDocumentOptions = API.CheckDocumentOptions;
export type CheckDocumentResponse = API.CheckDocumentResult;

export async function checkDocument(doc: DocumentInfo, options?: CheckDocumentOptions): Promise<CheckDocumentResponse> {
    const client = di.get('client');
    return client.serverApi.checkDocument(doc, options);
}
