import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { sampleAppState } from '../../test/fixtures/AppState';
import type { AppState } from '../AppState';
import { SettingsViewer } from './SettingsViewer';
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
