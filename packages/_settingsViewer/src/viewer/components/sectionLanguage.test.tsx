import * as React from 'react';
import { create } from 'react-test-renderer';
import { describe, expect, it } from 'vitest';

import { configTargets } from '../../api/settings/settingsHelper';
import { sampleAppState } from '../../test/fixtures/AppState';
import type { AppState } from '../AppState';
import { SectionLanguage } from './sectionLanguage';

describe('SectionLanguage Verification', () => {
    it('tests the snapshots', () => {
        const appState = getSampleAppState();
        configTargets.forEach((target) => {
            const panelRenderer = create(<SectionLanguage appState={appState} target={target}></SectionLanguage>).toJSON();
            expect(panelRenderer).toMatchSnapshot(`<SectionLanguage> for target: ${target}`);
        });
    });

    it('tests the handler', () => {
        const appState = getSampleAppState();
        const target = 'user';
        const panelRenderer = create(<SectionLanguage appState={appState} target={target}></SectionLanguage>);
        expect(panelRenderer.toJSON()).toMatchSnapshot(`<SectionLanguage> for target: ${target}`);
        expect(appState.settings.configs.user?.locales).not.toContain('cs');
        panelRenderer.toTree()?.instance.handleSelect({ code: 'cs', enabled: false });
        expect(appState.settings.configs.user?.locales).toContain('cs');
    });

    function getSampleAppState(): AppState {
        return sampleAppState();
    }
});
