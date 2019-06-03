/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { getDocUri, activate } from './helper';
import {expect} from 'chai';
import { ExtensionApi } from './ExtensionApi';

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

describe('Launch code spell extension', () => {
    const docUri = getDocUri('diagnostics.txt');

    it('Verify the extension starts', async () => {
        const context = await activate(docUri)
        expect(context).to.not.be.undefined;
        const extApi = context!.extApi;
        expect(extApi).to.not.be.undefined;
        expect(extApi).haveOwnProperty(apiSignature.addWordToUserDictionary);
        expect(extApi).to.include.all.keys(...Object.keys(apiSignature));
    })
})
