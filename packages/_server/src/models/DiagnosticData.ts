import { IssueType } from 'cspell-lib';

export interface DiagnosticData {
    issueType?: IssueType | undefined;
    suggestions?: string[] | undefined;
}
