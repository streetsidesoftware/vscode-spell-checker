import * as React from 'react';
import { AppState } from '../AppState';
import { create } from 'react-test-renderer';
import { PanelConfig } from './panelConfig';
import { sampleAppState } from '../../test/fixtures/AppState';
import { ConfigTarget } from '../../api/settings';

describe('Config Panel Verification', () => {
    it('tests the snapshot', () => {
        const appState = getSampleAppState();
        const targets: ConfigTarget[] = ['user', 'workspace', 'folder'];
        targets.forEach((_target) => {
            const panelRenderer = create(<PanelConfig appState={appState} target="user"></PanelConfig>).toJSON()!;
            expect(panelRenderer).toMatchSnapshot();
        });
    });

    function getSampleAppState(): AppState {
        return sampleAppState();
    }
});
