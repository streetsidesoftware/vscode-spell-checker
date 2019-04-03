
import * as React from 'react';
import { AppState } from '../AppState';
import { create } from 'react-test-renderer';
import { SectionLanguage } from './sectionLanguage';
import { configTargets } from '../../api/settings/settingsHelper';
import { sampleAppState } from '../../test/fixtures/AppState';

describe('SectionLanguage Verification', () => {
    it('tests the snapshots', () => {
        const appState = getSampleAppState();
        configTargets.forEach(target => {
            const panelRenderer = create(<SectionLanguage appState={appState} target={target}></SectionLanguage>).toJSON()!;
            expect(panelRenderer).toMatchSnapshot(`<SectionLanguage> for target: ${target}`);
        });
    });

    it('tests the handler', () => {
        const appState = getSampleAppState();
        const target = 'user';
        const panelRenderer = create(<SectionLanguage appState={appState} target={target}></SectionLanguage>);
        expect(panelRenderer.toJSON()).toMatchSnapshot(`<SectionLanguage> for target: ${target}`);
        expect(appState.settings.configs.user!.locals).not.toContain('cs');
        panelRenderer.toTree()!.instance.handleSelect(0);
        expect(appState.settings.configs.user!.locals).toContain('cs');
    });

    function getSampleAppState(): AppState {
        return sampleAppState();
    }
});
