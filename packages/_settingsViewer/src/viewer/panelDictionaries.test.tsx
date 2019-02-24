
import * as React from 'react';
import { AppState } from './AppState';
import { create } from 'react-test-renderer';
import { sampleSettings } from './samples/sampleSettings';
import { PanelDictionaries } from './panelDictionaries';

describe('Dictionary Panel Verification', () => {
    it('tests the snapshot', () => {
        const appState = getSampleAppState();
        const panelRenderer = create(<PanelDictionaries appState={appState}></PanelDictionaries>).toJSON()!;
        expect(panelRenderer).toMatchSnapshot();
    });

    function getSampleAppState(): AppState {
        const appState: AppState = new AppState();
        appState.settings = sampleSettings;
        return appState;
    }
});
