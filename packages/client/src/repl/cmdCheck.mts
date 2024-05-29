import type * as API from 'code-spell-checker-server/api';
import type { CancellationToken, Uri } from 'vscode';

import { checkDocument } from '../api.mjs';
import { colors } from './ansiUtils.mjs';
import { formatPath, relative } from './formatPath.mjs';

const maxPathLen = 60;

export async function cmdCheckDocument(uri: Uri | string, options: CheckDocumentsOptions, index?: number, count?: number): Promise<void> {
    const { forceCheck, output, log, width } = options;

    const startTs = performance.now();
    const prefix = countPrefix(index, count);

    output(`${prefix}${colors.gray(formatPath(relative(uri), Math.min(maxPathLen, width - 10 - prefix.length)))}`);
    const result = await checkDocument({ uri: uri.toString() }, { forceCheck });

    const elapsed = performance.now() - startTs;
    const elapsedTime = elapsed.toFixed(2) + 'ms';

    if (result.skipped) {
        log(` ${elapsedTime} S`);
        return;
    }

    const lines: string[] = [];

    const issues = result.issues?.filter((issue) => !issue.isSuggestion);

    const failed = !!(result.errors || issues?.length);

    lines.push(` ${elapsedTime}${failed ? colors.red(' X') : ''}`);

    if (result.errors) {
        lines.push(`${colors.red('Errors: ')} ${result.errors}`);
    }

    if (issues) {
        for (const issue of issues) {
            lines.push(formatIssue(uri, issue));
        }
    }

    log('%s', lines.join('\n'));
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
    const message = isFlagged ? 'Flagged word ' : 'Unknown word ';
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

export async function cmdCheckDocuments(uris: (string | Uri)[], options: CheckDocumentsOptions): Promise<void> {
    const count = uris.length;
    for (let index = 0; index < count; index++) {
        const uri = uris[index];
        if (options.cancellationToken.isCancellationRequested) {
            return;
        }
        try {
            await cmdCheckDocument(uri, options, index, count);
        } catch (error) {
            options.error(error);
            return;
        }
    }
}
