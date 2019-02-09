
import * as React from 'react';
import { LanguagePanel } from './panelLanguage';
import { AppState } from './AppState';
import * as renderer from 'react-test-renderer';

describe('Language Panel Verification', () => {
    it('tests the snapshot', () => {
        const appState: AppState = new AppState();
        const panelRenderer = renderer.create(<LanguagePanel appState={appState}></LanguagePanel>).toJSON()!;
        expect(panelRenderer).toMatchSnapshot();
    });
});
