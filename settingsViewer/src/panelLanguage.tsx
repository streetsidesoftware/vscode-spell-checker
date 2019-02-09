import * as React from 'react';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import {Checkbox} from '@material/react-checkbox';
import { AppState } from './AppState';
import * as spellCheckIcon from './images/SpellCheck.xs.png';
import {tf} from './utils';

export class LanguagePanel extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const settings = appState.settings;
        const locals = settings.locals.map((local, index) => <Row>
            <Cell columns={4}>{local.name}</Cell>
            <Cell columns={4}>{local.dictionaries.join(', ')}</Cell>
            <Cell columns={1}>
                <Checkbox
                    checked={!!local.isInUserSettings}
                    indeterminate={local.isInUserSettings === undefined}
                    onChange={(e) => {
                        const v = e.target.indeterminate ? undefined : e.target.checked;
                        appState.settings.locals[index].isInUserSettings = v;
                        appState.settings.locals[index].isInFolderSettings = v;
                    }}
                    initRipple={(e) => {}}
                ></Checkbox>
            </Cell>
            <Cell columns={1}>
                <Checkbox
                    checked={!!local.isInWorkspaceSettings}
                    indeterminate={local.isInWorkspaceSettings === undefined}
                    onChange={(e) => {
                        const v = e.target.indeterminate ? undefined : e.target.checked;
                        appState.settings.locals[index].isInWorkspaceSettings = v;
                    }}
                    initRipple={(e) => {}}
                ></Checkbox>
            </Cell>
            <Cell columns={1}>
                <Checkbox
                    checked={!!local.isInFolderSettings}
                    indeterminate={local.isInFolderSettings === undefined}
                    onChange={(e) => {
                        const v = e.target.indeterminate ? undefined : e.target.checked;
                        appState.settings.locals[index].isInFolderSettings = v;
                    }}
                    initRipple={(e) => {}}
                ></Checkbox>
            </Cell>
            <Cell columns={1}>{tf(local.enabled)}</Cell>
        </Row>);
        return (
            <Grid>
                <Row>
                    <Cell columns={12}>
                        <img src={spellCheckIcon} />
                    </Cell>
                </Row>
                {locals}
            </Grid>
        );
     }
}
