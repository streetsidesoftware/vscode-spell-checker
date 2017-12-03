//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import { expect } from 'chai';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Tests', function() {
    this.timeout(60000);

    test('Server Integration Tests', async () => {
        const cspell = vscode.extensions.getExtension<myExtension.ExtensionApi>('streetsidesoftware.code-spell-checker');
        expect(cspell).to.not.be.undefined;

        const api = await cspell!.activate();
        const doc = await loadDoc();
        const client = api.cSpellClient();
        const config = await client.getConfigurationForDocument(doc);
        expect(config).to.be.not.undefined;
        expect(config.fileEnabled).to.be.true;
        expect(config.languageEnabled).to.be.true;
    });

    // Defines a Mocha unit test
    test('Something 1', () => {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
});

function loadDoc() {
    return vscode.workspace.openTextDocument(__filename);
}