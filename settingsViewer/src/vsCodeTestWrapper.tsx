import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable, reaction, toJS} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import Button from '@material/react-button';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import { isUpdateCounterMessage, isMessage } from './message';
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
                    {settings.locals.map((local, index) =>
                        <Row>
                        <Cell columns={12}>
                            code: {local.code}
                            name: {local.name}
                            dictionaries {local.dictionaries.join(', ')}
                            user: {tf(local.isInUserSettings)}
                            workspace: {tf(local.isInWorkspaceSettings)}
                            folder: {tf(local.isInFolderSettings)}
                            enabled: {tf(local.enabled)}
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
     }
}

const appState = new AppState();
reaction(
    () => toJS(appState.settings),
    value => (
        console.log('post ConfigurationChangeMessage'),

        vsCodeApi.postMessage({ command: 'ConfigurationChangeMessage', value: { settings: toJS(appState.settings) } })
    )
);
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
        vsCodeApi.postMessage(message);
    }
};
