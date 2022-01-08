import { registerCspellInlineCompletionProviders } from './autocomplete';
import { languages } from 'vscode';

const mockedRegisterCompletionItemProvider = jest.mocked(languages.registerCompletionItemProvider);

describe('autocomplete', () => {
    test('registerCspellInlineCompletionProviders', async () => {
        const disposables: { dispose(): any }[] = [];
        await registerCspellInlineCompletionProviders(disposables);
        expect(mockedRegisterCompletionItemProvider).toHaveBeenCalledTimes(4);
        expect(disposables).toHaveLength(4);
    });
});
