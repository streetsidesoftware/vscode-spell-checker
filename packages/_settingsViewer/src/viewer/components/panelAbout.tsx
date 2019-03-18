import * as React from 'react';
import {observer} from 'mobx-react';
import { AppState } from '../AppState';
import {VsCodeWebviewApi} from '../../api/vscode/VsCodeWebviewApi';
import { Button } from '@material/react-button';
import * as spellCheckIcon from '../images/SpellCheck.xs.png';

const vsCodeApi = new VsCodeWebviewApi();

@observer
export class PanelAbout extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const workspace = (appState.settings.workspace || {});
        return (
            <div>
                <h1><img src={spellCheckIcon} /> Code Spell Checker</h1>

                <Button
                    className="button-alternate"
                    onClick={this.onReset}
                >
                    Refresh
                </Button>
                {/* <DevTools /> */}

                <h2>Workspace</h2>
                <pre>{JSON.stringify(workspace, null, 2)}</pre>

                <h2>Configs</h2>
                <pre>{JSON.stringify(appState.settings.configs, null, 2)}</pre>

            </div>
        );
     }

     onReset = () => {
        vsCodeApi.postMessage({ command: 'RequestConfigurationMessage'});
    }
}
