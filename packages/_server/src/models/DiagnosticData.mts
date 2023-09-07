import type { IssueType } from 'cspell-lib';

import type { Suggestion } from './Suggestion.mjs';

export interface DiagnosticData {
    issueType?: IssueType | undefined;
    suggestions?: Suggestion[] | undefined;
}
