import { CompletionItem } from './extHostTypes';

describe('Validate types', () => {
    test('CompletionItem', () => {
        const c = new CompletionItem('hello');
        expect(c.label).toBe('hello');
    });
});
