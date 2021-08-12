import { Uri } from 'vscode';
import {} from './infoView';

// const { execCommandUri } = __testing__;

describe('infoView', () => {
    test('execCommandUri', () => {
        const uri = Uri.parse(
            'command:vscode.open?%5B%22file%3A%2F%2F%2FUsers%2Fjason%2Fprojects%2Fvscode-spell-checker%2Ffixtures%2Fworkspaces%2Fconfig-in-package%2Fpackage.json%22%5D'
        );
        expect(uri.scheme).toBe('command');
    });
});
