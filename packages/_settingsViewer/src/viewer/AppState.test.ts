import { toJS } from 'mobx';
import { describe, expect, test } from 'vitest';
import type { Settings } from 'webview-api';

import { MessageBus } from '../api';
import type { WebviewApi } from '../api/WebviewApi';
import { sampleSettings, sampleSettingsSingleFolder } from '../test/samples/sampleSettings';
import { AppState } from './AppState';

// cspell:ignore ripgrep

describe('Validate AppState', () => {
    test('tabs', () => {
        expect(getSampleAppState(sampleSettings).tabs.map((t) => t.target)).toEqual([
            'user',
            'workspace',
            'folder',
            'file',
            'dictionaries',
            'about',
        ]);
        expect(getSampleAppState(sampleSettingsSingleFolder).tabs.map((t) => t.target)).toEqual([
            'user',
            'workspace',
            'file',
            'dictionaries',
            'about',
        ]);
    });

    test('actionActivateTab', () => {
        const appState = getSampleAppState(sampleSettings);
        appState.actionActivateTab('File');
        expect(appState.activeTab).toEqual({ label: 'File', target: 'file' });
        appState.actionActivateTab('');
        expect(appState.activeTab).toEqual({ label: 'User', target: 'user' });
        appState.actionActivateTab('About');
        expect(appState.activeTab).toEqual({ label: 'About', target: 'about' });
    });

    test('actionActivateTabIndex', () => {
        const appState = getSampleAppState(sampleSettings);
        appState.actionActivateTabIndex(3);
        expect(appState.activeTabIndex).toBe(3);
        expect(appState.activeTab).toEqual({ label: 'File', target: 'file' });
        appState.actionActivateTabIndex(0);
        expect(appState.activeTabIndex).toBe(0);
        expect(appState.activeTab).toEqual({ label: 'User', target: 'user' });
        appState.actionActivateTabIndex(5);
        expect(appState.activeTab).toEqual({ label: 'About', target: 'about' });
        appState.actionActivateTabIndex(7);
        expect(appState.activeTabIndex).toBe(5);
        expect(appState.activeTab).toEqual({ label: 'About', target: 'about' });
        appState.actionActivateTabIndex(-1);
        expect(appState.activeTab).toEqual({ label: 'About', target: 'about' });
    });

    test('actionSelectFolder', () => {
        const appState = getSampleAppState(sampleSettings);
        // const uri = 'file:///Users/cspell/projects/clones/ripgrep';
        const folderName = 'ripgrep';
        appState.actionSelectFolder(folderName);
        expect(appState.activeWorkspaceFolder).toBe(folderName);
        appState.actionSelectFolder('unknown');
        expect(appState.activeWorkspaceFolder).toBeUndefined();
    });

    test('languageConfig', () => {
        const appState = getSampleAppState(sampleSettings);
        expect(toJS(appState.languageConfig)).toMatchSnapshot();
    });

    test('workspaceFolderNames', () => {
        const appState = getSampleAppState(sampleSettings);
        expect(toJS(appState.workspaceFolderNames)).toMatchSnapshot();
    });

    function getSampleAppState(settings: Settings): AppState {
        const webviewApi: WebviewApi = {
            postMessage: () => webviewApi,
            onmessage: undefined,
        };
        const msgBus = new MessageBus(webviewApi);
        const appState: AppState = new AppState(msgBus);
        appState.updateSettings(settings);
        return appState;
    }
});
