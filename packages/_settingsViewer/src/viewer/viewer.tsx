import { reaction, toJS } from 'mobx';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { MessageBus } from '../api';
import type { ConfigurationChangeMessage } from '../api/message';
import { VsCodeWebviewApi } from '../api/vscode/VsCodeWebviewApi';
import { AppState } from './AppState';
import { SettingsViewer } from './components/SettingsViewer';

const messageBus = new MessageBus(new VsCodeWebviewApi());
const appState = new AppState(messageBus);
reaction(
    () => toJS(appState.settings),
    () => messageBus.postMessage({ command: 'ConfigurationChangeMessage', value: { settings: toJS(appState.settings) } }),
);
messageBus.listenFor('ConfigurationChangeMessage', (msg: ConfigurationChangeMessage) => {
    const { settings, activeTab } = msg.value;
    if (activeTab) appState.actionActivateTab(activeTab);
    appState.updateSettings(settings);
});

messageBus.postMessage({ command: 'RequestConfigurationMessage', value: {} });

ReactDOM.render(<SettingsViewer appState={appState} />, document.getElementById('root'));
