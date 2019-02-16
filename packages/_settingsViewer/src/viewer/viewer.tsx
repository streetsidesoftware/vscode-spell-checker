import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {reaction, toJS} from 'mobx';
import { UpdateCounterMessage, ConfigurationChangeMessage } from '../api/message';
import {AppState} from './AppState';
import { SettingsViewer } from './SettingsViewer';
import { MessageBus } from '../api';

require('./app.scss');

const messageBus = new MessageBus();
const appState = new AppState();
reaction(() => appState.timer, value => messageBus.postMessage({ command: 'UpdateCounter', value: value * 2 }));
reaction(
    () => toJS(appState.settings),
    value => (
        messageBus.postMessage({ command: 'ConfigurationChangeMessage', value: { settings: toJS(appState.settings) } })
    )
);
ReactDOM.render(<SettingsViewer appState={appState} />, document.getElementById('root'));

messageBus.listenFor('UpdateCounter', (msg: UpdateCounterMessage) => appState.counter = msg.value);
messageBus.listenFor('ConfigurationChangeMessage', (msg: ConfigurationChangeMessage) => appState.settings = msg.value.settings);

messageBus.postMessage({ command: 'RequestConfigurationMessage' });
