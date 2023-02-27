import { IssueType } from 'cspell-lib';

import type { Suggestion } from './Suggestion';

export interface DiagnosticData {
    issueType?: IssueType | undefined;
    suggestions?: Suggestion[] | undefined;
}
