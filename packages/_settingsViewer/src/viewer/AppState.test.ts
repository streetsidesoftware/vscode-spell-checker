
import { AppState } from './AppState';
import { sampleSettings } from './samples/sampleSettings';

describe('Validate AppState', () => {
    it('tests the snapshots', () => {
        const appState = getSampleAppState();
        const inheritedConfig = appState.inheritedConfigs;
        expect(inheritedConfig.user).not.toBeUndefined();
        expect(inheritedConfig.workspace).not.toBeUndefined();
        expect(inheritedConfig.folder).not.toBeUndefined();
        expect(inheritedConfig.file).not.toBeUndefined();
    });

    function getSampleAppState(): AppState {
        const appState: AppState = new AppState();
        appState.settings = sampleSettings;
        return appState;
    }
});
