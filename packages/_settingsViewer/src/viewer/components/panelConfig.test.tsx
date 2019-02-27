
import * as React from 'react';
import { AppState } from '../AppState';
import { create } from 'react-test-renderer';
import { sampleSettings } from '../samples/sampleSettings';
import { PanelConfig } from './panelConfig';

describe('Config Panel Verification', () => {
    it('tests the snapshot', () => {
        const appState = getSampleAppState();
        const panelRenderer = create(<PanelConfig appState={appState} target='user'></PanelConfig>).toJSON()!;
        expect(panelRenderer).toMatchSnapshot();
    });

    function getSampleAppState(): AppState {
        const appState: AppState = new AppState();
        appState.settings = sampleSettings;
        return appState;
    }
});
