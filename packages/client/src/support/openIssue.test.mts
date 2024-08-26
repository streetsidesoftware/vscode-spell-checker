import { describe, expect, test, vi } from 'vitest';

import { createNegativeFeedbackIssueURL } from './openIssue.mjs';

vi.mock('vscode');

describe('openIssue', () => {
    test('createNegativeFeedbackIssueUri', () => {
        const url = createNegativeFeedbackIssueURL();
        expect(url.href).toContain('issues/new');
    });
});
