
import * as React from 'react';
import { create } from 'react-test-renderer';
import { sampleAppState } from '../../test/fixtures/AppState';
import { PanelFile } from './panelFile';

describe('File Panel Verification', () => {
    it('tests the snapshot', () => {
        const appState = getSampleAppState();
        const panelRenderer = create(<PanelFile appState={appState}></PanelFile>).toJSON()!;
        expect(panelRenderer).toMatchSnapshot();
    });

    it('tests the handler', () => {
        const appState = getSampleAppState();
        const panelRenderer = create(<PanelFile appState={appState}></PanelFile>);
        expect(appState.settings.configs.file!.languageEnabled).toBe(true);
        panelRenderer.toTree()!.instance.enableLanguageId(false);
        expect(appState.settings.configs.file!.languageEnabled).toBe(false);
        expect(appState._postedMessages).toEqual([{
            "command": "EnableLanguageIdMessage",
            "value": {
                "enabled": false,
                "languageId": "typescript",
                "target": undefined,
            },
        }]);
    });

    function getSampleAppState() {
        return sampleAppState();
    }
});
