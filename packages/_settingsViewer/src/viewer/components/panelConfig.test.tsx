import * as React from 'react';
import { create } from 'react-test-renderer';
import { describe, expect, it } from 'vitest';

import { ConfigTarget } from '../../api/settings';
import { sampleAppState } from '../../test/fixtures/AppState';
import { AppState } from '../AppState';
import { PanelConfig } from './panelConfig';

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
