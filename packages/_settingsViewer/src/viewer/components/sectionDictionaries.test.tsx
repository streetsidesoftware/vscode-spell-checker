import * as React from 'react';
import { AppState } from '../AppState';
import { create } from 'react-test-renderer';
import { sampleAppState } from '../../test/fixtures/AppState';
import { SectionDictionaries } from './sectionDictionaries';

describe('SectionDictionaries Verification', () => {
    it('tests the snapshots', () => {
        const appState = getSampleAppState();
        const dictionaries = appState.settings.dictionaries;
        const panelRenderer = create(<SectionDictionaries dictionaries={dictionaries}></SectionDictionaries>).toJSON()!;
        expect(panelRenderer).toMatchSnapshot();
    });

    function getSampleAppState(): AppState {
        return sampleAppState();
    }
});
