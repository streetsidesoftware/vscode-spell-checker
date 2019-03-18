import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable, toJS} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import Button from '@material/react-button';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import { UpdateCounterMessage, ConfigurationChangeMessage, SelectTabMessage } from '../api/message';
import { VsCodeWebviewApi } from '../api/vscode/VsCodeWebviewApi';
import { Settings, ConfigTarget } from '../api/settings';
import { MessageBus } from '../api';
import { sampleSettings } from './samples/sampleSettings';

require('./app.scss');

class AppState {
    @observable counter = 0;
    @observable settings: Settings = {...sampleSettings};
    @observable activeTab: string = 'About';
}

const localDisplay: [ConfigTarget, string][] = [
    ['user', 'Global'],
    ['workspace', 'Workspace'],
    ['folder', 'Folder'],
    ['file', 'File'],
];

@observer
class VsCodeTestWrapperView extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const settings = appState.settings;
        const getLocals = (target: ConfigTarget) => {
            const config = settings.configs[target];
            if (!config) return '-';
            return (config.locals || ['-']).join(', ');
        }
        return (
            <div>
                <h2>Locals</h2>
                <Grid>
                    <Row>
                        <Cell columns={2}>
                            Scope
                        </Cell>
                        <Cell columns={10}>
                            Value
                        </Cell>
                    </Row>
                    {localDisplay.map(([field, name]) => <Row id={field}>
                        <Cell columns={2}>{name}</Cell>
                        <Cell columns={10}>{getLocals(field)}</Cell>
                    </Row>)}

                </Grid>
                <div>
                    <h2>Info</h2>
                    Panel: {appState.activeTab}
                </div>
                <div>
                    <div>{appState.counter}</div>
                    <Button
                        raised
                        className="button-alternate"
                        onClick={this.onUpdateConfig}
                    >
                        Update
                    </Button>
                </div>
                <DevTools />
            </div>
        );
     }

     onUpdateConfig = () => {
         console.log('onUpdateConfig');
         postSettings();
     }
}

const appState = new AppState();
/*
reaction(
    () => toJS(appState.settings),
    value => (
        console.log('post ConfigurationChangeMessage'),

        vsCodeApi.postMessage({ command: 'ConfigurationChangeMessage', value: { settings: toJS(appState.settings) } });
    )
);
*/
ReactDOM.render(<VsCodeTestWrapperView appState={appState} />, document.getElementById('root'));

const messageBus = new MessageBus(new VsCodeWebviewApi());

messageBus.listenFor('UpdateCounter', (msg: UpdateCounterMessage) => {
    appState.counter = msg.value;
    messageBus.postMessage({ command: 'UpdateCounter', value: msg.value });
});
messageBus.listenFor( 'RequestConfigurationMessage', postSettings );

function postSettings() {
    messageBus.postMessage({
        command: 'ConfigurationChangeMessage',
        value: {
            activeTab: toJS(appState.activeTab),
            settings: toJS(appState.settings),
        }
    });
}

messageBus.listenFor(
    'ConfigurationChangeMessage',
    (msg: ConfigurationChangeMessage) => {
        appState.settings = msg.value.settings;
    }
);

messageBus.listenFor(
    'SelectTabMessage',
    (msg: SelectTabMessage) => {
        appState.activeTab = msg.value;
    }
);
