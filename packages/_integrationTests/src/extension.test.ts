/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { getDocUri, activateExtension, loadDocument, sleep, log, chalk, sampleWorkspaceUri } from './helper';
import { expect } from 'chai';
import { ExtensionApi } from './ExtensionApi';
import * as vscode from 'vscode';

type Api = {
    [K in keyof ExtensionApi]: K;
};

const apiSignature: Api = {
    addWordToUserDictionary: 'addWordToUserDictionary',
    addWordToWorkspaceDictionary: 'addWordToWorkspaceDictionary',
    disableCurrentLanguage: 'disableCurrentLanguage',
    disableLanguageId: 'disableLanguageId',
    disableLocale: 'disableLocale',
    enableCurrentLanguage: 'enableCurrentLanguage',
    enableLanguageId: 'enableLanguageId',
    enableLocale: 'enableLocale',
    registerConfig: 'registerConfig',
    triggerGetSettings: 'triggerGetSettings',
    updateSettings: 'updateSettings',
    cSpellClient: 'cSpellClient',
};

describe('Launch code spell extension', function () {
    this.timeout(120000);
    const docUri = getDocUri('diagnostics.txt');

    it('Verify the extension starts', async () => {
        log(chalk.yellow('Verify the extension starts'));
        const extContext = await activateExtension();
        const docContext = await loadDocument(docUri);
        expect(extContext).to.not.be.undefined;
        expect(docContext).to.not.be.undefined;
        const extApi = extContext!.extApi;
        expect(extApi).to.not.be.undefined;
        expect(extApi).to.equal(extContext?.extActivate);
        expect(extApi).haveOwnProperty(apiSignature.addWordToUserDictionary);
        expect(extApi).to.include.all.keys(...Object.keys(apiSignature));
        log(chalk.yellow('Done: Verify the extension starts'));
    });

    [
        [getDocUri('example.md'), getDocUri('cspell.json')],
        [sampleWorkspaceUri('workspace1/README.md'), sampleWorkspaceUri('cspell.json')],
    ].forEach(([docUri, expectedConfigUri]) => {
        it(`Verifies that the right config was found for ${docUri.toString()}`, async () => {
            log(chalk.yellow('Verifies that the right config was found'));
            const ext = isDefined(await activateExtension());
            const uri = docUri;
            const folders = vscode.workspace.workspaceFolders;
            log(
                `Workspace Folders:
            %O
            `,
                folders
            );
            const docContextMaybe = await loadDocument(uri);
            expect(docContextMaybe).to.not.be.undefined;
            const docContext = isDefined(docContextMaybe);

            const config = await ext.extApi.cSpellClient().getConfigurationForDocument(docContext.doc);

            const { excludedBy, fileEnabled, configFiles } = config;
            log('config: %o', { excludedBy, fileEnabled, configFiles });

            const configUri = vscode.Uri.parse(config.configFiles[0] || '');
            expect(configUri.toString()).to.equal(expectedConfigUri.toString());
            log(chalk.yellow('Done: Verifies that the right config was found'));
        });
    });

    it('Verifies that some spelling errors were found', async () => {
        log(chalk.yellow('Verifies that some spelling errors were found'));
        const ext = isDefined(await activateExtension());
        const uri = getDocUri('example.md');
        const diagsListener = waitForDiag(uri, 10000);
        try {
            const docContextMaybe = await loadDocument(uri);
            expect(docContextMaybe).to.not.be.undefined;
            const docContext = isDefined(docContextMaybe);

            const config = await ext.extApi.cSpellClient().getConfigurationForDocument(docContext.doc);

            const { excludedBy, fileEnabled } = config;
            log('config: %O', { excludedBy, fileEnabled });

            const cfg = config.docSettings || config.settings;
            const { enabled, dictionaries, languageId } = cfg || {};

            log('cfg: %O', { enabled, dictionaries, languageId });

            const diags = await diagsListener.diags;
            const msgs = diags.map((a) => `C: ${a.source} M: ${a.message}`).join('\n');
            log(`Diag Messages: size(${diags.length}) msg: \n${msgs}`);
            log('diags: \n%o', diags);

            expect(fileEnabled).to.be.true;

            // cspell:ignore spellling
            expect(msgs).contains('spellling');
        } finally {
            diagsListener.dispose();
        }
        log(chalk.yellow('Done: Verifies that some spelling errors were found'));
    });

    function waitForDiag(uri: vscode.Uri, timeout: number) {
        type R = vscode.Diagnostic[];
        const source = 'cSpell';
        const diags: R = [];
        const uriStr = uri.toString();
        let dispose: vscode.Disposable | undefined;

        function fetchDiags() {
            return vscode.languages.getDiagnostics(uri).filter((diag) => diag.source === source);
        }

        function updateDiags() {
            log('updateDiags');
            diags.splice(0, diags.length, ...fetchDiags());
        }

        function cleanUp() {
            dispose?.dispose();
            dispose = undefined;
        }

        updateDiags();

        const diagsP = new Promise<R>((resolve) => {
            let resolved = false;
            function resolveP() {
                if (!resolved) {
                    resolved = true;
                    resolve(diags);
                }
            }

            async function updateAndResolve() {
                updateDiags();
                let i;
                for (i = 0; i < 10 && !diags.length; ++i) {
                    log('sleeping %d', i);
                    await sleep(1000);
                    updateDiags();
                }
                log('Matching Diags: %o', diags);
                resolveP();
            }

            dispose = vscode.languages.onDidChangeDiagnostics((event) => {
                log('onDidChangeDiagnostics %o', event);
                log(chalk`{green All for uri diags:} %o`, vscode.languages.getDiagnostics(uri));
                log(chalk`{green ALL diags:}\n%o`, vscode.languages.getDiagnostics());
                const matches = event.uris.filter((u) => u.toString() === uriStr);
                if (matches.length) {
                    updateAndResolve();
                }
            });

            if (diags.length) {
                resolveP();
            }
        });

        const waitResult = {
            diags: Promise.race([diagsP, sleep(timeout)]).then((r) => r || diags),
            dispose: cleanUp,
        };

        return waitResult;
    }
});

function isDefined<T>(t: T | undefined): T {
    if (t === undefined) {
        throw new Error('undefined');
    }
    return t;
}
