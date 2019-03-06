import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {reaction, toJS} from 'mobx';
import { UpdateCounterMessage, ConfigurationChangeMessage } from '../api/message';
import {AppState} from './AppState';
import { SettingsViewer } from './components/SettingsViewer';
import { MessageBus } from '../api';
import { VsCodeWebviewApi } from '../api/vscode/VsCodeWebviewApi';

require('./app.scss');

const messageBus = new MessageBus(new VsCodeWebviewApi());
const appState = new AppState();
reaction(() => appState.timer, value => messageBus.postMessage({ command: 'UpdateCounter', value: value * 2 }));
reaction(
    () => toJS(appState.settings),
    value => (
        messageBus.postMessage({ command: 'ConfigurationChangeMessage', value: { settings: toJS(appState.settings) } })
    )
);
reaction(
    () => appState.activeTabName,
    value => {
        console.log(`ChangeTabMessage: ${value}`);
        messageBus.postMessage({ command: 'ChangeTabMessage', value });
    },
);

messageBus.listenFor('UpdateCounter', (msg: UpdateCounterMessage) => appState.counter = msg.value);
messageBus.listenFor('ConfigurationChangeMessage', (msg: ConfigurationChangeMessage) => {
    const { settings, activeTab } = msg.value;
    console.log(`ConfigurationChangeMessage: ${activeTab}`);
    if (activeTab) appState.activateTab(activeTab);
    appState.settings = settings
});

messageBus.postMessage({ command: 'RequestConfigurationMessage' });

ReactDOM.render(<SettingsViewer appState={appState} />, document.getElementById('root'));

