import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconSettings from '@material-ui/icons/Settings';
import { observer } from 'mobx-react';
import * as React from 'react';

import { VsCodeWebviewApi } from '../../api/vscode/VsCodeWebviewApi';
import type { AppState } from '../AppState';
// resources
import spellCheckIcon from '../images/SpellCheck.xs.png';
import { CsButton, CsCheckBox, CsList as List } from './primitives';

const vsCodeApi = new VsCodeWebviewApi();

@observer
export class PanelAbout extends React.Component<{ appState: AppState }> {
    render(): JSX.Element {
        const appState = this.props.appState;
        const workspace = appState.settings.workspace || {};
        const toggle = () => this.props.appState.actionSetDebugMode(!appState.debugMode);
        return (
            <div>
                <h1>
                    <img style={{ verticalAlign: 'middle', paddingBottom: '8px' }} src={spellCheckIcon} />
                    <span>&nbsp;Code Spell Checker</span>
                </h1>

                <CsButton variant="contained" color="primary" onClick={this.onReset}>
                    Refresh
                </CsButton>
                <h2>Options</h2>
                <div>
                    <div>
                        <List>
                            <ListItem onClick={toggle}>
                                <ListItemIcon>
                                    <IconSettings />
                                </ListItemIcon>
                                <ListItemText primary={'Debug Mode'} />
                                <ListItemSecondaryAction>
                                    <CsCheckBox checked={appState.debugMode} onChange={toggle} />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </div>
                </div>
                {/* <DevTools /> */}
                {appState.debugMode ? (
                    <div>
                        <h2>Workspace</h2>
                        <pre>{JSON.stringify(workspace, null, 2)}</pre>

                        <h2>Configs</h2>
                        <pre>{JSON.stringify(appState.settings.configs, null, 2)}</pre>
                    </div>
                ) : (
                    ''
                )}
            </div>
        );
    }

    onReset: () => void = () => {
        vsCodeApi.postMessage({ command: 'RequestConfigurationMessage' });
    };
}
