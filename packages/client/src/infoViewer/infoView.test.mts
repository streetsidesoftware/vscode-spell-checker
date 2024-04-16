import { describe, expect, test, vi } from 'vitest';
import { Uri } from 'vscode';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

import {} from './infoView.mjs';

// const { execCommandUri } = __testing__;
// cspell:ignoreRegExp /%[0-9A-F][0-9A-F]/g

describe('infoView', () => {
    test('execCommandUri', () => {
        const uri = Uri.parse(
            'command:vscode.open?%5B%22file%3A%2F%2F%2FUsers%2Fjason%2Fprojects%2Fvscode-spell-checker%2Ffixtures%2Fworkspaces%2Fconfig-in-package%2Fpackage.json%22%5D',
        );
        expect(uri.scheme).toBe('command');
    });
});
