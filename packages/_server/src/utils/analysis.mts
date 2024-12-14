import { opFilter, opMap, opTake, pipe } from '@cspell/cspell-pipe/sync';
import type { TextDocument } from 'vscode-languageserver-textdocument';

import type { BlockedFileReason } from '../api.js';
import type { CSpellUserAndExtensionSettings } from '../config/cspellConfig/index.mjs';

export type MinifiedReason = BlockedFileReason;

export const ReasonLineLength: MinifiedReason = {
    code: 'Lines_too_long.',
    message: 'Lines are too long.',
    notificationMessage:
        'For performance reasons, the spell checker does not check documents where the line length is greater than ${limit}.',
    settingsUri: 'vscode://settings/cSpell.blockCheckingWhenLineLengthGreaterThan',
    settingsID: 'cSpell.blockCheckingWhenLineLengthGreaterThan',
    documentationRefUri:
        'https://streetsidesoftware.com/vscode-spell-checker/docs/configuration/performance/#cspellblockcheckingwhenlinelengthgreaterthan',
};

export const ReasonAverageWordsSize: MinifiedReason = {
    code: 'Word_Size_Too_High.',
    message: 'Average word length is too long.',
    notificationMessage:
        'For performance reasons, the spell checker does not check documents where the average block ' +
        'of text without spaces or word breaks is greater than ${limit}.',
    settingsUri: 'vscode://settings/cSpell.blockCheckingWhenAverageChunkSizeGreaterThan',
    settingsID: 'cSpell.blockCheckingWhenAverageChunkSizeGreaterThan',
    documentationRefUri:
        'https://streetsidesoftware.com/vscode-spell-checker/docs/configuration/performance/#cspellblockcheckingwhenaveragechunksizegreaterthan',
};
export const ReasonMaxWordsSize: MinifiedReason = {
    code: 'Maximum_Word_Length_Exceeded',
    message: 'Maximum word length exceeded.',
    notificationMessage:
        'For performance reasons, the spell checker does not check documents with very long blocks of text ' +
        'without spaces or word breaks. The limit is currently ${limit}.',
    settingsUri: 'vscode://settings/cSpell.blockCheckingWhenTextChunkSizeGreaterThan',
    settingsID: 'cSpell.blockCheckingWhenTextChunkSizeGreaterThan',
    documentationRefUri:
        'https://streetsidesoftware.com/vscode-spell-checker/docs/configuration/performance/#cspellblockcheckingwhentextchunksizegreaterthan',
};

export interface IsTextLikelyMinifiedOptions {
    /** The maximum line length */
    blockCheckingWhenLineLengthGreaterThan: number;
    /** The maximum size of text chunks */
    blockCheckingWhenTextChunkSizeGreaterThan: number;
    /**
     * The maximum average chunk size.
     * A chunk is the characters between absolute word breaks.
     * Absolute word breaks match: `/[\s,{}[\]]/`
     */
    blockCheckingWhenAverageChunkSizeGreaterThan: number;
}

export const defaultIsTextLikelyMinifiedOptions: IsTextLikelyMinifiedOptions = {
    blockCheckingWhenLineLengthGreaterThan: 10000,
    blockCheckingWhenTextChunkSizeGreaterThan: 500,
    blockCheckingWhenAverageChunkSizeGreaterThan: 80,
};

export function hydrateReason(reason: MinifiedReason, limit: number): MinifiedReason {
    return {
        ...reason,
        notificationMessage: reason.notificationMessage.replaceAll('${limit}', limit.toString()),
    };
}

const ignoreUrls = /\b[a-z]{3,}:\/[-/a-z0-9@:%._+~#=?&]+/gi;

/**
 * Check if a document is minified making spell checking difficult and slow.
 *
 * @param doc - document to check.
 * @returns true - if the file might be minified.
 */
export function isTextLikelyMinified(text: string, options: IsTextLikelyMinifiedOptions): MinifiedReason | false {
    const first100 = getFirstNLinesWithText(text, 100).map((a) => a.replace(ignoreUrls, ''));

    const over1k = first100.find((a) => a.length > options.blockCheckingWhenLineLengthGreaterThan);
    if (over1k) {
        return hydrateReason(ReasonLineLength, options.blockCheckingWhenLineLengthGreaterThan);
    }

    const sampleText = first100.join('\n');
    const chunks = [...sampleText.matchAll(/[\s,{}[\]/]+/g)].map((a) => a.index || 0);
    chunks.push(sampleText.length);
    const wordCount = chunks.length;
    const avgChunkSize = sampleText.length / wordCount;
    if (avgChunkSize > options.blockCheckingWhenAverageChunkSizeGreaterThan) {
        return hydrateReason(ReasonAverageWordsSize, options.blockCheckingWhenAverageChunkSizeGreaterThan);
    }

    const maxChunkSize = chunks.reduce((a, b) => [b, Math.max(a[1], b - a[0])], [0, 0])[1];
    if (maxChunkSize > options.blockCheckingWhenTextChunkSizeGreaterThan) {
        return hydrateReason(ReasonMaxWordsSize, options.blockCheckingWhenTextChunkSizeGreaterThan);
    }

    return false;
}

export function getFirstNLinesWithText(text: string, n: number): string[] {
    return [
        ...pipe(
            text.matchAll(/^.*$/gm),
            opMap((a) => a[0].trim()),
            opFilter((a) => !!a),
            opTake(n),
        ),
    ];
}

export type ShouldValidateDocument = Pick<TextDocument, 'uri'> & Partial<TextDocument>;

export type ShouldCheckDocumentOptions = Pick<CSpellUserAndExtensionSettings, 'checkVSCodeSystemFiles'>;

const vsCodeSystemFilesRegExp = /^vscode-userdata:\/.*\/(?:settings|keybindings).json$/i;

const BlockedFileReasonSystemFile: BlockedFileReason = {
    code: 'VSCode_System_File',
    message: 'VS Code System File',
    notificationMessage: '',
    settingsUri: 'vscode://settings/cSpell.checkVSCodeSystemFiles',
    settingsID: 'cSpell.checkVSCodeSystemFiles',
    documentationRefUri: 'https://streetsidesoftware.com/vscode-spell-checker/docs/configuration/performance/#cspellcheckvscodesystemfiles',
};

export function shouldBlockDocumentCheck(document: ShouldValidateDocument, options: ShouldCheckDocumentOptions): BlockedFileReason | false {
    const { uri } = document;
    if (!uri) return false;
    if (options.checkVSCodeSystemFiles) return false;
    return vsCodeSystemFilesRegExp.test(uri) ? BlockedFileReasonSystemFile : false;
}
