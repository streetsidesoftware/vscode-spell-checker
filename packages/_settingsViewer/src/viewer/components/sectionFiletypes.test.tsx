import * as React from 'react';
import { AppState } from '../AppState';
import { create } from 'react-test-renderer';
import { configTargets } from '../../api/settings/settingsHelper';
import { sampleAppState } from '../../test/fixtures/AppState';
import { SectionFiletypes } from './sectionFiletypes';

describe('SectionFileTypes Verification', () => {
    it('tests the snapshots', () => {
        const appState = getSampleAppState();
        configTargets.forEach((target) => {
            const panelRenderer = create(<SectionFiletypes appState={appState} target={target}></SectionFiletypes>).toJSON()!;
            expect(panelRenderer).toMatchSnapshot(`<SectionFiletypes> for target: ${target}`);
        });
    });

    function getSampleAppState(): AppState {
        return sampleAppState();
    }
});
