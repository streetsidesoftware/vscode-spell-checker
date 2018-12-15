import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable, reaction, toJS} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import Button from '@material/react-button';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import { isUpdateCounterMessage, isMessage } from './message';
import { ConfigurationForDocument } from './settings/';
import { VsCodeWebviewApi } from './vscode/VsCodeWebviewApi';
import {tf} from './utils';

require('./app.scss');

class AppState {
  @observable counter = 0;
  @observable config: ConfigurationForDocument = {
      languageEnabled: false,
      fileEnabled: false,
      settings: {},
      docSettings: {},
  };
}

@observer
class VsCodeTestWrapperView extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const config = appState.config;
        return (
            <div>
                <Grid>
                    <Row>
                        <Cell columns={12}>
                            {appState.counter}
                        </Cell>
                        <Cell columns={12}>
                            Language Enabled: {tf(config.languageEnabled)}
                        </Cell>
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
         this.props.appState.config.languageEnabled = !this.props.appState.config.languageEnabled;
         // this.props.appState.config = {...this.props.appState.config};
     }
}

const appState = new AppState();
reaction(
    () => toJS(appState.config),
    value => (
        console.log('post ConfigurationChangeMessage'),

        vsCodeApi.postMessage({ command: 'ConfigurationChangeMessage', value: { config: toJS(appState.config) } })
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
