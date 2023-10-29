import type { IssueType } from '@cspell/cspell-types';
import type { Diagnostic } from 'vscode-languageserver-types';

import type { Suggestion } from './Suggestion.mjs';
import type { DiagnosticSource } from './types.mjs';

export interface SpellCheckerDiagnosticData {
    /** The text of the issue. It is expected to match `document.getText(diag.range)` */
    text?: string;
    issueType?: IssueType | undefined;
    /** The issue indicates that the word has been flagged as an error. */
    isFlagged?: boolean | undefined;
    /** The issue is a suggested change, but is not considered an error. */
    isSuggestion?: boolean | undefined;
    suggestions?: Suggestion[] | undefined;
}

export interface SpellingDiagnostic extends Diagnostic {
    source: DiagnosticSource;
    data: SpellCheckerDiagnosticData;
}
