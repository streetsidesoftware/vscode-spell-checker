// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

// Defines a Mocha test suite to group tests of similar kind together
describe('Extension Tests', () => {
    test('Server Integration Tests', async () => {
        const cspell = vscode.extensions.getExtension<myExtension.ExtensionApi>('streetsidesoftware.code-spell-checker');
        expect(cspell).toBeDefined();

        const api = await cspell!.activate();
        const doc = await loadDoc();
        const client = api.cSpellClient();
        const config = await client.getConfigurationForDocument(doc);
        expect(config).toBeDefined();
        expect(config.fileEnabled).toBe(true);
        expect(config.languageEnabled).toBe(true);
    });
});

function loadDoc() {
    return vscode.workspace.openTextDocument(__filename);
}
