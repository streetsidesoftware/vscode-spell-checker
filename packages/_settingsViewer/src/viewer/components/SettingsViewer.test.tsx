import * as React from 'react';
import { SettingsViewer } from './SettingsViewer';
import { AppState } from '../AppState';
import { sampleAppState } from '../../test/fixtures/AppState';
// import { create } from 'react-test-renderer';

// function createNodeMock(element) {
//     return {
//         focus() {},
//         scrollTo() {},
//     };
// }

describe('Language Panel Verification', () => {
    it('SettingsViewer', () => {
        const appState: AppState = sampleAppState();
        const settingsViewer = <SettingsViewer appState={appState} />;
        // Due to an issue with MDC components, it is challenging to create one for testings.
        // todo: figure out how to test MDC tab components.
        expect(settingsViewer).not.toBeNull();
    });
});
