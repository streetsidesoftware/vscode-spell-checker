import { mocked } from 'ts-jest/utils';
import { registerCspellInlineCompletionProviders } from './autocomplete';
import { languages } from 'vscode';

const mockedRegisterCompletionItemProvider = mocked(languages.registerCompletionItemProvider);

describe('autocomplete', () => {
    test('registerCspellInlineCompletionProviders', async () => {
        const disposables: { dispose(): any }[] = [];
        await registerCspellInlineCompletionProviders(disposables);
        expect(mockedRegisterCompletionItemProvider).toHaveBeenCalledTimes(4);
        expect(disposables).toHaveLength(4);
    });
});
