import * as React from 'react';
import { AppState } from '../AppState';
import { create } from 'react-test-renderer';
import { sampleAppState } from '../../test/fixtures/AppState';
import { SectionConfigFileList } from './sectionConfigFileList';

describe('SectionConfigFileList Verification', () => {
    it('tests the snapshots', () => {
        const appState = getSampleAppState();
        const configFiles = appState.settings.configs.file?.configFiles || [];
        const panelRenderer = create(<SectionConfigFileList configFiles={configFiles}></SectionConfigFileList>).toJSON()!;
        expect(panelRenderer).toMatchSnapshot();
    });

    function getSampleAppState(): AppState {
        return sampleAppState();
    }
});
