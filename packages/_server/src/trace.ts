import { groupByField } from '@internal/common-utils';
import type { CSpellSettings, DocumentValidator, TraceOptions } from 'cspell-lib';
import { traceWordsAsync } from 'cspell-lib';
import { TextDocument } from 'vscode-languageserver-textdocument';

import type * as Api from './api.js';
import type { DocumentValidationController } from './DocumentValidationController.mjs';
import { readTextDocument, stat } from './vfs/index.mjs';

export interface TraceWordOptions extends TraceOptions {
    searchAllDictionaries?: boolean;
}

export async function traceWord(
    docValidationController: DocumentValidationController,
    doc: TextDocument,
    word: string,
    options: TraceWordOptions | undefined,
): Promise<Api.TraceWordResult> {
    const docVal = await docValidationController.getDocumentValidator(doc);
    const { searchAllDictionaries, ...traceOptions } = options || {};
    if (!searchAllDictionaries && !Object.keys(traceOptions).length) {
        return simpleDocTrace(docVal, word);
    }

    const finalizedSettings = docVal.getFinalizedDocSettings();

    const { dictionaries, enabled } = extractDictionaryList(finalizedSettings);
    const settings = { ...docVal.getFinalizedDocSettings(), dictionaries };

    const enabledDicts = new Set(enabled);

    const traceResult = await trace(word, settings, traceOptions);
    if (!traceResult) return { word, errors: 'No trace result.' };

    const byWord = groupByField(traceResult, 'word');
    const traces: Exclude<Api.TraceWordResult['traces'], undefined> = [...byWord.entries()].map(([word, traces]) => ({
        word,
        found: isFound(traces),
        traces: traces.map((t) => ({ ...t, errors: errorsToString(t.errors), dictEnabled: enabledDicts.has(t.dictName) })),
    }));

    const splits = traceResult.splits || traces.map(({ word, found }) => ({ word, found }));

    return { word, traces, splits };
}

function simpleDocTrace(docVal: DocumentValidator, word: string): Api.TraceWordResult {
    const trace = docVal.traceWord(word);

    const byWord = groupByField(trace, 'word');
    const traces: Exclude<Api.TraceWordResult['traces'], undefined> = [...byWord.entries()].map(([word, traces]) => ({
        word,
        found: isFound(traces),
        traces: traces.map((t) => ({ ...t, errors: errorsToString(t.errors), dictEnabled: true })),
    }));

    const splits = trace.splits || traces.map(({ word, found }) => ({ word, found }));

    return { word, traces, splits };
}

async function trace(word: string, settings: CSpellSettings, options?: TraceOptions) {
    for await (const traceResult of traceWordsAsync([word], settings, options)) {
        return traceResult;
    }
}

function extractDictionaryList(settings: CSpellSettings) {
    const enabled = settings.dictionaries || [];
    const dictionaries = (settings.dictionaryDefinitions || []).map((d) => d.name);
    return { enabled, dictionaries };
}

export async function handleTraceRequest(
    docValidationController: DocumentValidationController,
    req: Api.TraceWordRequest,
    getCachedDoc: (uri: string) => TextDocument | undefined,
): Promise<Api.TraceWordResult> {
    const { word, uri, ...options } = req;
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
    return traceWord(docValidationController, doc, word, options);
}

function errorsToString(errors: Error[] | undefined): string | undefined {
    if (!errors || !errors.length) return undefined;
    return errors.map((e) => e.message).join('\n');
}

function isFound(traces: { found: boolean }[]): boolean {
    return traces.some((t) => t.found);
}
