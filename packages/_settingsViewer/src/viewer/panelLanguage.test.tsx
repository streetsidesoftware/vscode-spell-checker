
import * as React from 'react';
import { LanguagePanel, checkboxLocalInfo } from './panelLanguage';
import { AppState } from './AppState';
import { create } from 'react-test-renderer';
import { LocalSetting, Settings } from '../api/settings';

describe('Language Panel Verification', () => {
    it('checkboxLocalInfo', () => {
        const appState = getSampleAppState();
        const field: keyof LocalSetting = 'folder';
        const codeEn = 'en';
        const codeEs = 'es';
        appState.setLocal(field, codeEn, true);
        appState.setLocal(field, codeEs, true);
        const checkbox = create(checkboxLocalInfo(appState, codeEn, field));
        expect(checkbox.toJSON()).toMatchSnapshot();
        const instance = checkbox.getInstance()!;
        instance.props['onChange']({target: { checked: false, indeterminate: false }});
        expect(appState.isLocalEnabled(field, codeEn)).toBe(false);
        instance.props['onChange']({target: { checked: true, indeterminate: false }});
        expect(appState.isLocalEnabled(field, codeEn)).toBe(true);

        // check what happens when all locals are removed.
        appState.setLocal(field, codeEs, false);
        instance.props['onChange']({target: { checked: true, indeterminate: true }});
        expect(appState.isLocalEnabled(field, codeEn)).toBeUndefined();
        instance.props['onChange']({target: { checked: true, indeterminate: false }});
        expect(appState.isLocalEnabled(field, codeEn)).toBe(true);
        instance.props['onChange']({target: { checked: false, indeterminate: false }});
        expect(appState.isLocalEnabled(field, codeEn)).toBeUndefined();
    });

    it('tests the snapshot', () => {
        const appState = getSampleAppState();
        const panelRenderer = create(<LanguagePanel appState={appState}></LanguagePanel>).toJSON()!;
        expect(panelRenderer).toMatchSnapshot();
    });

    function getSampleAppState(): AppState {
        const sampleSettings: Settings = {
            configs: {
                user: undefined,
                workspace: undefined,
                file: undefined,
                folder: undefined,
            },
            locals: {
                user: ['en', 'es'],
                workspace: undefined,
                folder: undefined,
                file: ['en'],
            },
            dictionaries: [
                {
                    name: 'en_US',
                    locals: ['en', 'en-us'],
                    description: 'US English Dictionary'
                },
                {
                    name: 'es_ES',
                    locals: ['es', 'es-es'],
                    description: 'Spanish Dictionary'
                },
                {
                    name: 'fr_fr',
                    locals: ['fr', 'fr-fr'],
                    description: 'French Dictionary'
                },
            ],
        }

        const appState: AppState = new AppState();
        appState.settings = sampleSettings;
        return appState;
    }
});
