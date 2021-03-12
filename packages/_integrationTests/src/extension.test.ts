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
    cSpellClient: 'cSpellClient',
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
        expect(extApi).to.equal(extContext?.extActivate);
        expect(extApi).haveOwnProperty(apiSignature.addWordToUserDictionary);
        expect(extApi).to.include.all.keys(...Object.keys(apiSignature));
    });

    it('Verifies that some spelling errors were found', async () => {
        const ext = isDefined(await activateExtension());
        const uri = getDocUri('example.md');
        const diagsListener = waitForDiag(uri);
        try {
            const docContextMaybe = await loadDocument(uri);
            expect(docContextMaybe).to.not.be.undefined;
            const docContext = isDefined(docContextMaybe);

            const config = await ext.extApi.cSpellClient().getConfigurationForDocument(docContext.doc);

            const { excludedBy, fileEnabled } = config;
            console.log(`config: ${JSON.stringify({ excludedBy, fileEnabled })}`);

            const cfg = config.docSettings || config.settings;
            const { enabled, dictionaries, languageId } = cfg || {};

            console.log(JSON.stringify({ enabled, dictionaries, languageId }));

            const diags = await Promise.race([diagsListener.diags, sleep(10000)]);

            await sleep(3000);
            const msgs = diags ? diags.map((a) => `C: ${a.source} M: ${a.message}`).join(', ') : 'Timeout';
            console.log(`Diag Messages: size(${diags?.length}) msg: ${msgs}`);

            expect(fileEnabled).to.be.true;

            // cspell:ignore spellling
            expect(msgs).contains('spellling');
        } finally {
            diagsListener.dispose();
        }
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
                    .map((d) => (console.log(JSON.stringify(d)), d))
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

function isDefined<T>(t: T | undefined): T {
    if (t === undefined) {
        throw new Error('undefined');
    }
    return t;
}
