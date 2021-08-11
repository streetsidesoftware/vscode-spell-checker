import { mocked } from 'ts-jest/utils';
import { registerCspellInlineCompletionProviders } from './autocomplete';
import { languages } from 'vscode';

const mockedRegisterCompletionItemProvider = mocked(languages.registerCompletionItemProvider);

describe('autocomplete', () => {
    test('registerCspellInlineCompletionProviders', () => {
        const disposables = registerCspellInlineCompletionProviders();
        expect(mockedRegisterCompletionItemProvider).toHaveBeenCalledTimes(2);
        expect(disposables).toHaveLength(2);
    });
});
