/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { getDocUri, activateExtension, loadDocument, sleep } from './helper';
import {expect} from 'chai';
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
    // disableLocal: 'disableLocal',
    enableCurrentLanguage: 'enableCurrentLanguage',
    enableLanguageId: 'enableLanguageId',
    // enableLocal: 'enableLocal',
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

        const check = diagsListener.diags.then(diags => {
            const msgs = diags.map(a => `C: ${a.source} M: ${a.message}`).join(', ');
            // cspell:ignore spellling
            expect(msgs).contains('spellling');
            console.log(`Diag Messages: ${msgs}`);
        });

        return Promise.race([check, sleep(4000).then(() => Promise.reject('timeout'))]).finally(() => diagsListener.dispose());
    });

    function waitForDiag(uri: vscode.Uri) {
        type R = vscode.Diagnostic[];
        const source = 'cSpell';
        const uriStr = uri.toString();
        let resolver: (value?: R | PromiseLike<R>) => any | undefined;
        let dispose: vscode.Disposable | undefined;
        dispose = vscode.languages.onDidChangeDiagnostics((event) => {
            const matches = event.uris.map(u => u.toString()).filter(u => u === uriStr);
            if (matches.length) {
                const diags = vscode.languages.getDiagnostics(uri).filter(diag => diag.source === source);
                cleanUp();
                resolver && resolver(diags);
            }
        });

        function cleanUp() {
            dispose && dispose.dispose();
            dispose = undefined;
        }
        return {
            diags: new Promise<R>(resolve => resolver = resolve),
            dispose: cleanUp,
        };
    }

    // it('Slows down the integration test for manual manipulation.', async () => {
    //     return new Promise((resolve) => {
    //         console.log('Waiting 30s');
    //         setTimeout(resolve, 30000);
    //     });
    // });
});
