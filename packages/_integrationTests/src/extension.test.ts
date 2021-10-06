/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { expect } from 'chai';
import { stream, Stream } from 'kefir';
import * as vscode from 'vscode';
import { CSpellClient } from '../../client/dist/client';
import { OnSpellCheckDocumentStep } from '../../_server/dist/api';
import { ExtensionApi } from './ExtensionApi';
import { activateExtension, chalk, getDocUri, loadDocument, log, sampleWorkspaceUri, sleep } from './helper';

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
    enableLocal: 'enableLocal',
    disableLocal: 'disableLocal',
};

describe('Launch code spell extension', function () {
    this.timeout(120000);
    const docUri = getDocUri('diagnostics.txt');
    const spellCheckNotifications: OnSpellCheckDocumentStep[] = [];
    const disposables: { dispose: () => void }[] = [];

    this.beforeAll(() => {
        activateExtension().then((ext) => {
            disposables.push(ext.extApi.cSpellClient().onSpellCheckDocumentNotification((n) => spellCheckNotifications.push(n)));
        });
    });

    this.afterEach(async () => {
        disposables.forEach((d) => d.dispose());
        disposables.length = 0;
        await sleep(1000);
    });

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
        const uri = getDocUri('example.md');
        const docContextMaybe = await loadDocument(uri);
        await sleep(500);
        // Force a spell check by making an edit.
        const r = vscode.window.activeTextEditor?.edit((edit) => edit.insert(new vscode.Position(0, 0), '#'));
        expect(docContextMaybe).to.not.be.undefined;
        const wait = waitForSpellComplete(uri, 5000);
        await r;

        const found = await wait;
        log('found %o', found);

        const diags = await getDiagsFromVsCode(uri, 2000);

        if (!diags.length) {
            log('all diags: %o', vscode.languages.getDiagnostics());
        }

        // await sleep(5 * 1000);

        expect(found).to.not.be.undefined;

        const msgs = diags.map((a) => `C: ${a.source} M: ${a.message}`).join('\n');
        log(`Diag Messages: size(${diags.length}) msg: \n${msgs}`);
        log('diags: %o', diags);

        // cspell:ignore spellling
        expect(msgs).contains('spellling');
        log(chalk.yellow('Done: Verifies that some spelling errors were found'));
    });

    it('Wait a bit', async () => {
        // This is useful for debugging and you want to see the VS Code UI.
        // Set `secondsToWait` to 30 or more.
        const secondsToWait = 1;
        await sleep(secondsToWait * 1000);
        expect(true).to.be.true;
    });
});

function streamOnSpellCheckDocumentNotification(cSpellClient: CSpellClient): Stream<OnSpellCheckDocumentStep, undefined> {
    return stream<OnSpellCheckDocumentStep, undefined>((emitter) => {
        const d = cSpellClient.onSpellCheckDocumentNotification(emitter.value);
        return () => d.dispose();
    });
}

async function waitForSpellComplete(uri: vscode.Uri, timeout: number): Promise<OnSpellCheckDocumentStep | undefined> {
    const matchUri = uri.toString();
    const ext = await activateExtension();
    const s = streamOnSpellCheckDocumentNotification(ext.extApi.cSpellClient())
        .filter((v) => v.uri === matchUri)
        .filter((v) => !!v.done)
        .take(1);
    return Promise.race([s.toPromise(), sleep(timeout)]);
}

async function getDiagsFromVsCode(uri: vscode.Uri, waitInMs: number): Promise<vscode.Diagnostic[]> {
    let stop = false;
    setInterval(() => (stop = true), waitInMs);
    let diag: vscode.Diagnostic[] = vscode.languages.getDiagnostics(uri);
    while (!stop && !diag.length) {
        await sleep(5);
        diag = vscode.languages.getDiagnostics(uri);
    }
    return diag;
}

function isDefined<T>(t: T | undefined): T {
    if (t === undefined) {
        throw new Error('undefined');
    }
    return t;
}
