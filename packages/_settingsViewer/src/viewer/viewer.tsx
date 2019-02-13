import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {reaction, toJS} from 'mobx';
import {VsCodeWebviewApi} from '../api/vscode/VsCodeWebviewApi';
import { isUpdateCounterMessage, isConfigurationChangeMessage, isMessage } from '../api/message';
import {AppState} from './AppState';
import { SettingsViewer } from './SettingsViewer';

require('./app.scss');

const vsCodeApi = new VsCodeWebviewApi();
const appState = new AppState();
reaction(() => appState.timer, value => vsCodeApi.postMessage({ command: 'UpdateCounter', value: value * 2 }));
reaction(
    () => toJS(appState.settings),
    value => (
        vsCodeApi.postMessage({ command: 'ConfigurationChangeMessage', value: { settings: toJS(appState.settings) } })
    )
);
ReactDOM.render(<SettingsViewer appState={appState} />, document.getElementById('root'));

vsCodeApi.onmessage = (msg: MessageEvent) => {
    const message = msg.data;

    if (!isMessage(message)) {
        return;
    }

    if (isUpdateCounterMessage(message)) {
        appState.counter = message.value;
        return;
    }

    if (isConfigurationChangeMessage(message)) {
        appState.settings = message.value.settings;
        return;
    }
};

vsCodeApi.postMessage({ command: 'RequestConfigurationMessage' });
