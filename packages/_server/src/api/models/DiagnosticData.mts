import type { IssueType } from 'cspell-lib';

import type { Suggestion } from './Suggestion.mjs';

export interface SpellCheckerDiagnosticData {
    issueType?: IssueType | undefined;
    /** The issue indicates that the word has been flagged as an error. */
    isFlagged?: boolean | undefined;
    /** The issue is a suggested change, but is not considered an error. */
    isSuggestion?: boolean | undefined;
    suggestions?: Suggestion[] | undefined;
}
