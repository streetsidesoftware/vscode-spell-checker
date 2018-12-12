import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable, reaction} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import Button from '@material/react-button';
import { isUpdateCounterMessage, isMessage } from './message';
import { ConfigurationForDocument } from './settings/';
import { VsCodeWebviewApi } from './vscode/VsCodeWebviewApi';
import {tf} from './utils';

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
              {appState.counter}
              Language Enabled: {tf(config.languageEnabled)}
              <Button
                    raised
                    className="button-alternate"
                    onClick={this.onUpdateConfig}
                >
                    Update
                </Button>
              <DevTools />
            </div>
        );
     }

     onUpdateConfig = () => {
         console.log('onUpdateConfig');
         this.props.appState.config.languageEnabled = !this.props.appState.config.languageEnabled;
         this.props.appState.config = {...this.props.appState.config};
     }
}

const appState = new AppState();
reaction(
    () => appState.config,
    value => (
        console.log('post ConfigurationChangeMessage'),

        vsCodeApi.postMessage({ command: 'ConfigurationChangeMessage', value: { config: {...appState.config} } })
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
