import * as React from 'react';
import { create } from 'react-test-renderer';
import { describe, expect, it } from 'vitest';

import { sampleAppState } from '../../test/fixtures/AppState';
import type { AppState } from '../AppState';
import { SectionConfigFileList } from './sectionConfigFileList';

describe('SectionConfigFileList Verification', () => {
    it('tests the snapshots', () => {
        const appState = getSampleAppState();
        const configFiles = appState.settings.configs.file?.configFiles || [];
        const panelRenderer = create(<SectionConfigFileList configFiles={configFiles}></SectionConfigFileList>).toJSON();
        expect(panelRenderer).toMatchSnapshot();
    });

    function getSampleAppState(): AppState {
        return sampleAppState();
    }
});
