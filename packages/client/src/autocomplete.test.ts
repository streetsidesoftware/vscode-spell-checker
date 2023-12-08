import { describe, expect, test, vi } from 'vitest';
import { languages } from 'vscode';

import { registerCspellInlineCompletionProviders } from './autocomplete';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

const mockedRegisterCompletionItemProvider = vi.mocked(languages.registerCompletionItemProvider);
const mockedRegisterInlineCompletionItemProvider = vi.mocked(languages.registerInlineCompletionItemProvider);

describe('autocomplete', () => {
    test('registerCspellInlineCompletionProviders', async () => {
        const disposables: { dispose(): any }[] = [];
        await registerCspellInlineCompletionProviders(disposables);
        expect(mockedRegisterCompletionItemProvider).toHaveBeenCalledTimes(0);
        expect(mockedRegisterInlineCompletionItemProvider).toHaveBeenCalledTimes(1);
        expect(disposables).toHaveLength(1);
    });
});
