import type { IssueType } from '@cspell/cspell-types';
import type { Diagnostic, Range } from 'vscode-languageserver-types';

import type { Suggestion } from './Suggestion.mjs';
import type { DiagnosticSource } from './types.mjs';

export interface SpellCheckerDiagnosticData {
    /** The text of the issue. It is expected to match `document.getText(diag.range)` */
    text?: string;
    /** Indicate if it is a spell issue or directive issue */
    issueType?: IssueType | undefined;
    /** The issue indicates that the word has been flagged as an error. */
    isFlagged?: boolean | undefined;
    /** Indicate that is is a known spelling issue that is always considered misspelled. */
    isKnown?: boolean | undefined;
    /**
     * Indicate if strict rules should be applied.
     * - `true` indicates that unknown words should be flagged as a misspelling.
     * - `false` indicates that unknown words should be flagged as a suggestion.
     */
    strict?: boolean | undefined;
    /** The issue is a suggested change, but is not considered an error. */
    isSuggestion?: boolean | undefined;
    /** Optional list of suggestions. */
    suggestions?: Suggestion[] | undefined;
}

export interface SpellingDiagnostic extends Diagnostic {
    source: DiagnosticSource;
    data: SpellCheckerDiagnosticData;
}

export interface CheckDocumentIssue extends SpellCheckerDiagnosticData {
    text: string;
    range: Range;
}
