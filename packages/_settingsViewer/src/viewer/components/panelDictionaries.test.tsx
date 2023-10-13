import * as React from 'react';
import { create } from 'react-test-renderer';
import { describe, expect, it } from 'vitest';

import { sampleAppState } from '../../test/fixtures/AppState';
import type { AppState } from '../AppState';
import { PanelDictionaries } from './panelDictionaries';

describe('Dictionary Panel Verification', () => {
    it('tests the snapshot', () => {
        const appState = getSampleAppState();
        const panelRenderer = create(<PanelDictionaries appState={appState}></PanelDictionaries>).toJSON();
        expect(panelRenderer).toMatchSnapshot();
    });

    function getSampleAppState(): AppState {
        return sampleAppState();
    }
});
