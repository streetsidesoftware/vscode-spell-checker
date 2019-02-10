
import * as React from 'react';
import { LanguagePanel, checkboxLocalInfo } from './panelLanguage';
import { AppState } from './AppState';
import { create } from 'react-test-renderer';

describe('Language Panel Verification', () => {
    it('checkboxLocalInfo', () => {
        const appState: AppState = new AppState();
        const checkbox = create(checkboxLocalInfo(appState, appState.settings.locals[0], 0, 'isInFolderSettings'));
        expect(checkbox.toJSON()).toMatchSnapshot();
        const instance = checkbox.getInstance()!;
        instance.props['onChange']({target: { checked: false, indeterminate: false }});
        expect(appState.settings.locals[0].isInFolderSettings).toBe(false);
        instance.props['onChange']({target: { checked: true, indeterminate: false }});
        expect(appState.settings.locals[0].isInFolderSettings).toBe(true);
        instance.props['onChange']({target: { checked: true, indeterminate: true }});
        expect(appState.settings.locals[0].isInFolderSettings).toBeUndefined();
    });

    it('tests the snapshot', () => {
        const appState: AppState = new AppState();
        const panelRenderer = create(<LanguagePanel appState={appState}></LanguagePanel>).toJSON()!;
        expect(panelRenderer).toMatchSnapshot();
    });
});
