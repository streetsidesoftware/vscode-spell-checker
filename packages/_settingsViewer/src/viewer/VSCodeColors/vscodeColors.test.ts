import { describe, expect, test } from 'vitest';

import { getCssVar } from './vscodeColors';

describe('Validate VS Code Colors', () => {
    test('getCssVar', () => {
        let r: string | undefined;
        r = getCssVar('editor.foreground', 'dark');
        expect(r).toBe('var(--vscode-editor-foreground, #bbbbbb)');
        r = getCssVar('editor.background', 'dark');
        expect(r).toBe('var(--vscode-editor-background, #1e1e1e)');
        r = getCssVar('editor.foreground', 'light');
        expect(r).toBe('var(--vscode-editor-foreground, #333333)');
        r = getCssVar('editor.background', 'light');
        expect(r).toBe('var(--vscode-editor-background, #fffffe)');
    });
});
