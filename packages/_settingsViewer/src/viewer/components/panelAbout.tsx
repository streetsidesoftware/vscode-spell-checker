import * as React from 'react';
import {observer} from 'mobx-react';
import { AppState } from '../AppState';
import {VsCodeWebviewApi} from '../../api/vscode/VsCodeWebviewApi';
import { Button } from '@rmwc/button';
import { Checkbox } from '@rmwc/checkbox';
import { List, ListItem, ListItemGraphic, ListItemText, ListItemMeta, ListItemPrimaryText, } from '@rmwc/list';

// css
import '@rmwc/button/styles';
import '@rmwc/checkbox/styles';
import '@rmwc/list/styles';
import spellCheckIcon from '../images/SpellCheck.xs.png';

const vsCodeApi = new VsCodeWebviewApi();

@observer
export class PanelAbout extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const workspace = (appState.settings.workspace || {});
        return (
            <div>
                <h1>
                    <img style={{ verticalAlign: 'middle', paddingBottom: '8px'}} src={spellCheckIcon} />
                    <span>Code Spell Checker</span>
                </h1>

                <Button onClick={this.onReset} raised>
                    Refresh
                </Button>
                <h2>Options</h2>
                <div>
                    {/* <GridCell span={6}> */}
                    <div>
                    <List>
                        <ListItem onClick={() => this.props.appState.actionSetDebugMode(!appState.debugMode)}>
                            <ListItemGraphic icon="settings" />
                            Debug Mode
                            <ListItemMeta>
                                <Checkbox
                                    checked={appState.debugMode}
                                    // onChange={(evt) => this.props.appState.actionSetDebugMode(evt.currentTarget.checked)}
                                />
                            </ListItemMeta>
                        </ListItem>
                    </List>
                    {/* </GridCell> */}
                    </div>
                </div>
                {/* <DevTools /> */}
                {appState.debugMode ?
                <div>
                    <h2>Workspace</h2>
                    <pre>{JSON.stringify(workspace, null, 2)}</pre>

                    <h2>Configs</h2>
                    <pre>{JSON.stringify(appState.settings.configs, null, 2)}</pre>
                </div>
                : ''}
            </div>
        );
     }

     onReset = () => {
        vsCodeApi.postMessage({ command: 'RequestConfigurationMessage'});
    }
}
