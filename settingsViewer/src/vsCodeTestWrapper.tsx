import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable, reaction, toJS} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import Button from '@material/react-button';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import { isUpdateCounterMessage, isMessage, isConfigurationChangeMessage } from './message';
import { VsCodeWebviewApi } from './vscode/VsCodeWebviewApi';
import { Settings } from './settings/';
import {tf} from './utils';

require('./app.scss');

class AppState {
  @observable counter = 0;
  @observable settings: Settings = {
    locals: [
        {
            code: 'en',
            name: 'English',
            dictionaries: ['en', 'en-us'],
            enabled: true,
            isInUserSettings: true,
        },
        {
            code: 'es',
            name: 'Spanish',
            dictionaries: ['es', 'es-ES'],
            enabled: true,
            isInUserSettings: true,
        },
    ],
};
}

@observer
class VsCodeTestWrapperView extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const settings = appState.settings;
        return (
            <div>
                <Grid>
                    <Row>
                        <Cell columns={12}>
                            {appState.counter}
                        </Cell>
                    </Row>
                    <Row>
                        <Cell columns={1}>code</Cell>
                        <Cell columns={2}>name</Cell>
                        <Cell columns={2}>dictionaries</Cell>
                        <Cell columns={2}>user</Cell>
                        <Cell columns={2}>workspace</Cell>
                        <Cell columns={2}>folder</Cell>
                        <Cell columns={1}>enabled</Cell>
                    </Row>
                    {settings.locals.map((local, index) =>
                        <Row>
                        <Cell columns={1}>
                            {local.code}
                        </Cell>
                        <Cell columns={2}>
                            {local.name}
                        </Cell>
                        <Cell columns={2}>
                            {local.dictionaries.join(', ')}
                        </Cell>
                        <Cell columns={2}>
                            {tf(local.isInUserSettings)}
                        </Cell>
                        <Cell columns={2}>
                            {tf(local.isInWorkspaceSettings)}
                        </Cell>
                        <Cell columns={2}>
                            {tf(local.isInFolderSettings)}
                        </Cell>
                        <Cell columns={1}>
                            {tf(local.enabled)}
                        </Cell>
                        </Row>
                    )}
                    <Row>
                        <Cell columns={12}>
                            <Button
                                raised
                                className="button-alternate"
                                onClick={this.onUpdateConfig}
                            >
                                Update
                            </Button>
                        </Cell>
                    </Row>
                </Grid>
                <DevTools />
            </div>
        );
     }

     onUpdateConfig = () => {
         console.log('onUpdateConfig');
         this.props.appState.settings.locals.forEach(local => local.enabled = !local.enabled);
         vsCodeApi.postMessage({ command: 'ConfigurationChangeMessage', value: { settings: toJS(appState.settings) } });
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

const vsCodeApi = new VsCodeWebviewApi();

vsCodeApi.onmessage = event => {
    const message = event.data;

    if (!isMessage(message)) {
        return;
    }

    console.log(message.command);

    if (isUpdateCounterMessage(message)) {
        appState.counter = message.value;
        // For fun, let's send it back.
        vsCodeApi.postMessage(message);
    } else if (isConfigurationChangeMessage(message)) {
        appState.settings = message.value.settings;
    }
};
