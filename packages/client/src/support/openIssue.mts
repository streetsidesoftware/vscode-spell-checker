import { openExternalUrl } from '../util/openUrl.mjs';

const feedbackBody = `\
# Feedback

Thank you for providing feedback on the Spell Checker. Your feedback is important to us.

## How can the Spell Checker be improved?

<!-- Please provide details on how the Spell Checker can be improved. -->

## What issues are you experiencing?

<!-- Please provide details on the issues you are experiencing. -->

`;

export async function openNegativeFeedbackIssue(): Promise<void> {
    await openExternalUrl(createNegativeFeedbackIssueURL());
}

export function createNegativeFeedbackIssueURL(): URL {
    return formatGitHubIssueUrl({ title: 'Feedback', body: feedbackBody, labels: ['feedback'] });
}

interface GitHubIssue {
    title?: string;
    body?: string;
    labels?: string[];
}

export function formatGitHubIssueUrl(issue?: GitHubIssue): URL {
    const url = new URL('https://github.com/streetsidesoftware/vscode-spell-checker/issues/new');

    const params = url.searchParams;
    if (issue?.title) params.set('title', issue.title);
    if (issue?.body) params.set('body', issue.body);
    if (issue?.labels) params.set('labels', issue.labels.join(','));
    return url;
}
