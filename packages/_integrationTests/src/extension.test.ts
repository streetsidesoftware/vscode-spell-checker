/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { getDocUri, activateExtension, loadDocument, sleep } from './helper';
import { expect } from 'chai';
import { ExtensionApi } from './ExtensionApi';
import * as vscode from 'vscode';

type Api = {
    [K in keyof ExtensionApi]: K;
};

const apiSignature: Api = {
    addWordToUserDictionary: 'addWordToUserDictionary',
    addWordToWorkspaceDictionary: 'addWordToWorkspaceDictionary',
    // cSpellClient: 'cSpellClient',
    disableCurrentLanguage: 'disableCurrentLanguage',
    disableLanguageId: 'disableLanguageId',
    // disableLocale: 'disableLocale',
    enableCurrentLanguage: 'enableCurrentLanguage',
    enableLanguageId: 'enableLanguageId',
    // enableLocale: 'enableLocale',
    registerConfig: 'registerConfig',
    triggerGetSettings: 'triggerGetSettings',
    updateSettings: 'updateSettings',
};

describe('Launch code spell extension', function () {
    this.timeout(60000);
    const docUri = getDocUri('diagnostics.txt');

    it('Verify the extension starts', async () => {
        const extContext = await activateExtension();
        const docContext = await loadDocument(docUri);
        expect(extContext).to.not.be.undefined;
        expect(docContext).to.not.be.undefined;
        const extApi = extContext!.extApi;
        expect(extApi).to.not.be.undefined;
        expect(extApi).haveOwnProperty(apiSignature.addWordToUserDictionary);
        expect(extApi).to.include.all.keys(...Object.keys(apiSignature));
    });

    it('Verifies that some spelling errors were found', async () => {
        await activateExtension();
        const uri = getDocUri('example.md');
        const diagsListener = waitForDiag(uri);
        const docContextMaybe = await loadDocument(uri);
        expect(docContextMaybe).to.not.be.undefined;

        const check = diagsListener.diags.then(async (diags) => {
            const msgs = diags.map((a) => `C: ${a.source} M: ${a.message}`).join(', ');
            console.log(`Diag Messages: ${msgs}`);
            // Sleep a bit so the UI can be viewed if wanted.
            await sleep(3000);
            // cspell:ignore spellling
            const msgs2 = diags.map((a) => `C: ${a.source} M: ${a.message}`).join(', ');
            console.log(`Diag Messages: ${msgs2}`);
            expect(msgs2).contains('spellling');
        });

        return Promise.race([check, sleep(10000).then(() => Promise.reject('timeout'))]).finally(() => diagsListener.dispose());
    });

    function waitForDiag(uri: vscode.Uri) {
        type R = vscode.Diagnostic[];
        const diags: R = [];
        const source = 'cSpell';
        const uriStr = uri.toString();
        let resolver: (value: R | PromiseLike<R>) => void;
        let dispose: vscode.Disposable | undefined;
        dispose = vscode.languages.onDidChangeDiagnostics((event) => {
            const matches = event.uris.map((u) => u.toString()).filter((u) => u === uriStr);
            if (matches.length) {
                vscode.languages
                    .getDiagnostics(uri)
                    .filter((diag) => diag.source === source)
                    .forEach((diag) => diags.push(diag));
                resolver?.(diags);
            }
        });

        function cleanUp() {
            dispose?.dispose();
            dispose = undefined;
        }
        return {
            diags: new Promise<R>((resolve) => (resolver = resolve)),
            dispose: cleanUp,
        };
    }
});
