
import { AppState } from './AppState';
import { WebviewApi } from '../api/WebviewApi';
import { MessageBus } from '../api';
import { sampleSettings, sampleSettingsSingleFolder } from '../test/samples/sampleSettings';
import { Settings } from '../api/settings';

// cspell:ignore ripgrep

describe('Validate AppState', () => {
    it('tests the snapshots', () => {
        const appState = getSampleAppState(sampleSettings);
        const inheritedConfig = appState.inheritedConfigs;
        expect(inheritedConfig.user).not.toBeUndefined();
        expect(inheritedConfig.workspace).not.toBeUndefined();
        expect(inheritedConfig.folder).not.toBeUndefined();
    });

    test('tabs', () => {
        expect(getSampleAppState(sampleSettings).tabs.map(t => t.target)).toEqual(["user", "workspace", "folder", "file", "dictionaries", "about"])
        expect(getSampleAppState(sampleSettingsSingleFolder).tabs.map(t => t.target)).toEqual(["user", "workspace", "file", "dictionaries", "about"])
    });

    test('actionActivateTab', () => {
        const appState = getSampleAppState(sampleSettings);
        appState.actionActivateTab('File');
        expect(appState.activeTab).toEqual({ label: 'File', target: 'file'});
        appState.actionActivateTab('');
        expect(appState.activeTab).toEqual({ label: 'User', target: 'user'});
        appState.actionActivateTab('About');
        expect(appState.activeTab).toEqual({ label: 'About', target: 'about'});
    });

    test('actionActivateTabIndex', () => {
        const appState = getSampleAppState(sampleSettings);
        appState.actionActivateTabIndex(3);
        expect(appState.activeTabIndex).toBe(3);
        expect(appState.activeTab).toEqual({ label: 'File', target: 'file'});
        appState.actionActivateTabIndex(0);
        expect(appState.activeTabIndex).toBe(0);
        expect(appState.activeTab).toEqual({ label: 'User', target: 'user'});
        appState.actionActivateTabIndex(5);
        expect(appState.activeTab).toEqual({ label: 'About', target: 'about'});
        appState.actionActivateTabIndex(7);
        expect(appState.activeTabIndex).toBe(5);
        expect(appState.activeTab).toEqual({ label: 'About', target: 'about'});
        appState.actionActivateTabIndex(-1);
        expect(appState.activeTab).toEqual({ label: 'About', target: 'about'});
    });

    test('actionSelectFolder', () => {
        const appState = getSampleAppState(sampleSettings);
        const uri = 'file:///Users/cspell/projects/clones/ripgrep';
        const folderName = 'ripgrep';
        appState.actionSelectFolder(folderName);
        expect(appState.activeWorkspaceFolder).toBe(folderName);
        appState.actionSelectFolder('unknown');
        expect(appState.activeWorkspaceFolder).toBeUndefined();
    });

    function getSampleAppState(settings: Settings): AppState {
        const webviewApi: WebviewApi = {
            postMessage: (msg: any) => webviewApi,
            onmessage: undefined,
        };
        const msgBus = new MessageBus(webviewApi);
        const appState: AppState = new AppState(msgBus);
        appState.settings = settings;
        return appState;
    }
});
