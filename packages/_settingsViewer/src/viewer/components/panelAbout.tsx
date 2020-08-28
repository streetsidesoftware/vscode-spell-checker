import * as React from 'react';
import {observer} from 'mobx-react';
import { AppState } from '../AppState';
import {VsCodeWebviewApi} from '../../api/vscode/VsCodeWebviewApi';
import { Button } from '@rmwc/button';
import * as spellCheckIcon from '../images/SpellCheck.xs.png';
import { Checkbox } from '@rmwc/checkbox';
import { List, ListItem, ListItemGraphic, ListItemText, ListItemMeta, ListItemPrimaryText, } from '@rmwc/list';
import { Grid, GridRow, GridCell } from '@rmwc/grid';

const vsCodeApi = new VsCodeWebviewApi();

@observer
export class PanelAbout extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const workspace = (appState.settings.workspace || {});
        return (
            <Grid>
                <h1>
                    <img style={{ verticalAlign: 'middle', paddingBottom: '8px'}} src={spellCheckIcon} />
                    <span>Code Spell Checker</span>
                </h1>

                <Button
                    className="button-alternate"
                    onClick={this.onReset}
                >
                    Refresh
                </Button>
                <h2>Options</h2>
                <GridRow>
                    <GridCell span={6}>
                    <List>
                        <ListItem role="checkbox">
                            <ListItemGraphic icon="settings" />
                            <ListItemText>
                                <ListItemPrimaryText>Debug Mode</ListItemPrimaryText>
                            </ListItemText>
                            <ListItemMeta>
                                <Checkbox
                                    checked={appState.debugMode}
                                    onChange={(evt) => this.props.appState.actionSetDebugMode(evt.currentTarget.checked)}
                                />
                            </ListItemMeta>
                        </ListItem>
                    </List>
                    </GridCell>
                </GridRow>
                {/* <DevTools /> */}
                {appState.debugMode ?
                <div>
                    <h2>Workspace</h2>
                    <pre>{JSON.stringify(workspace, null, 2)}</pre>

                    <h2>Configs</h2>
                    <pre>{JSON.stringify(appState.settings.configs, null, 2)}</pre>
                </div>
                : ''}
            </Grid>
        );
     }

     onReset = () => {
        vsCodeApi.postMessage({ command: 'RequestConfigurationMessage'});
    }
}
