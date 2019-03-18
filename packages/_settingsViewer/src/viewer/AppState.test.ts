
import { AppState } from './AppState';
import { sampleSettings } from './samples/sampleSettings';
import { WebviewApi } from '../api/WebviewApi';
import { MessageBus } from '../api';

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
        const webviewApi: WebviewApi = {
            postMessage: (msg: any) => webviewApi,
            onmessage: undefined,
        };
        const msgBus = new MessageBus(webviewApi);
            const appState: AppState = new AppState(msgBus);
        appState.settings = sampleSettings;
        return appState;
    }
});
