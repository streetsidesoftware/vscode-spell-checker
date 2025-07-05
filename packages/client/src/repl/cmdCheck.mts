import type * as API from 'code-spell-checker-server/api';
import type { CancellationToken, Uri } from 'vscode';

import type { CheckDocumentResponse } from '../api.mjs';
import { checkDocument } from '../api.mjs';
import { squelch } from '../util/errors.js';
import { clearLine, colors } from './ansiUtils.mjs';
import { formatPath, relative } from './formatPath.mjs';

const maxPathLen = 60;

interface CheckResult {
    checked: boolean;
    issues: number;
}

const skippedCheck: CheckResult = { checked: false, issues: 0 };
const okCheck: CheckResult = { checked: true, issues: 0 };

async function cmdCheckDocument(prep: CheckDocumentPrep): Promise<CheckResult> {
    const { uri, options, index, count, result: pResult, startTs, endTs } = prep;
    const { output, log, width } = options;

    const prefix = countPrefix(index, count);

    output(`${prefix}${colors.gray(formatPath(relative(uri), Math.min(maxPathLen, width - 10 - prefix.length)))}`);
    const result = await pResult;

    const elapsed = (endTs || performance.now()) - startTs;
    const elapsedTime = elapsed.toFixed(2) + 'ms';

    if (result.skipped) {
        log(` ${elapsedTime} Skipped`);
        return skippedCheck;
    }

    const lines: string[] = [];

    const issues = result.issues?.filter((issue) => !issue.isSuggestion);

    const failed = !!(result.errors || issues?.length);

    lines.push(` ${elapsedTime}${failed ? colors.red(' X') : ''}`);

    if (!failed) {
        output(lines.join('') + '\r' + clearLine(0));
        return okCheck;
    }

    if (result.errors) {
        lines.push(`${colors.red('Errors: ')} ${result.errors}`);
    }

    if (issues) {
        for (const issue of issues) {
            lines.push(formatIssue(uri, issue));
        }
    }

    log('%s', lines.join('\n'));
    return { checked: true, issues: issues?.length || 0 };
}

function countPrefix(index?: number, count?: number): string {
    if (typeof index === 'undefined' || typeof count === 'undefined') return '';
    const countStr = count.toString();
    const indexStr = (index + 1).toString().padStart(countStr.length, ' ');
    return `${indexStr}/${countStr} `;
}

function formatIssue(uri: string | Uri, issue: API.CheckDocumentIssue): string {
    const { range, text, suggestions, isFlagged } = issue;
    const pos = `:${range.start.line + 1}:${range.start.character + 1}`;
    const message = isFlagged ? 'Flagged word' : 'Unknown word';
    const rel = relative(uri);
    const sugMsg = suggestions ? ` fix: (${suggestions.map((s) => colors.yellow(s.word)).join(', ')})` : '';
    return `  ${colors.green(rel)}${colors.yellow(pos)} - ${message} (${colors.red(text)})${sugMsg}`;
}

export interface CheckDocumentsOptions {
    log: typeof console.log;
    error: typeof console.error;
    output: (text: string) => void;
    cancellationToken: CancellationToken;
    forceCheck?: boolean;
    width: number;
}

interface CheckDocumentPrep {
    index: number;
    count: number;
    uri: string | Uri;
    startTs: number;
    endTs?: number;
    options: CheckDocumentsOptions;
    result: Promise<CheckDocumentResponse>;
}

function prepareCheckDocument(uri: string | Uri, options: CheckDocumentsOptions, index: number, count: number): CheckDocumentPrep {
    const { forceCheck } = options;

    const startTs = performance.now();

    const result = checkDocument({ uri: uri.toString() }, { forceCheck });
    const prep: CheckDocumentPrep = { index, count, uri, startTs, options, result };

    result.finally(() => (prep.endTs = performance.now())).catch(squelch('prepareCheckDocument'));
    return prep;
}

const prefetchCount = 10;

export async function cmdCheckDocuments(uris: (string | Uri)[], options: CheckDocumentsOptions): Promise<void> {
    const count = uris.length;

    options.log(`Checking ${count} documents`);

    const pending: CheckDocumentPrep[] = [];
    let files = 0;
    let filesWithIssues = 0;
    let issues = 0;
    let skipped = 0;

    try {
        let index = 0;
        for (; index < prefetchCount && index < count; index++) {
            const uri = uris[index];
            pending.push(prepareCheckDocument(uri, options, index, count));
        }

        while (!options.cancellationToken.isCancellationRequested) {
            try {
                const prep = pending.shift();
                if (!prep) break;
                const r = await cmdCheckDocument(prep);
                issues += r.issues;
                filesWithIssues += r.issues ? 1 : 0;
                files += r.checked ? 1 : 0;
                skipped += r.checked ? 0 : 1;
                if (index < count) {
                    const uri = uris[index];
                    pending.push(prepareCheckDocument(uri, options, index, count));
                    index++;
                }
            } catch (error) {
                options.error(error);
                break;
            }
        }
        //
        Promise.all(pending.map((p) => p.result)).catch((error: unknown) => {
            options.error(error);
        });
        options.log(
            `Checked ${files}/${count} files${skipped ? `, skipped ${skipped},` : ''} with ${issues} issues in ${filesWithIssues} files.`,
        );
    } catch {
        // All errors should have been reported.
        return;
    }
}
