import * as React from 'react';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import {Checkbox} from '@material/react-checkbox';
import { AppState } from '../AppState';
import * as spellCheckIcon from '../images/SpellCheck.xs.png';
import {tf} from '../../api/utils';
import { LocalInfo } from '../AppState';
import { LocalSetting, LocalId } from '../../api/settings';

type LocalSettingField = keyof LocalSetting;


export function checkboxLocalInfo(appState: AppState, code: LocalId, field: LocalSettingField) {
    const isEnabled = appState.isLocalEnabled(field, code);
    const checked = isEnabled || false;
    const indeterminate =  isEnabled === undefined;
    return <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        onChange={(e) => {
            const checked = e.target.indeterminate ? false : e.target.checked;
            appState.setLocal(field, code, checked);
        }}
        initRipple={() => {}}
    ></Checkbox>;
}

export class LanguagePanel extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const checkbox = (local: LocalInfo, field: LocalSettingField) =>
            checkboxLocalInfo(appState, local.code, field);
        const locals = appState.locals.map((local, index) => <Row key={index}>
            <Cell columns={3}>{local.name}<br/>{local.code}</Cell>
            <Cell columns={3}>{local.dictionaries.join(', ')}</Cell>
            <Cell columns={2}>
                {checkbox(local, 'user')}
            </Cell>
            <Cell columns={2}>
                {checkbox(local, 'workspace')}
            </Cell>
            <Cell columns={1}>
                {checkbox(local, 'folder')}
            </Cell>
            <Cell columns={1}>{tf(local && local.enabled)}</Cell>
        </Row>);
        return (
            <Grid>
                <Row>
                    <Cell columns={12}>
                        <img src={spellCheckIcon} />
                    </Cell>
                </Row>
                <Row>
                    <Cell columns={3}>Language</Cell>
                    <Cell columns={3}>dictionaries</Cell>
                    <Cell columns={2}>Global</Cell>
                    <Cell columns={2}>Workspace</Cell>
                    <Cell columns={1}>Folder</Cell>
                    <Cell columns={1}>Enabled</Cell>
                </Row>
                {locals}
            </Grid>
        );
     }
}
