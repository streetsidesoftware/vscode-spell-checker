import * as React from 'react';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import {Checkbox} from '@material/react-checkbox';
import { AppState } from './AppState';
import * as spellCheckIcon from './images/SpellCheck.xs.png';
import {tf} from '../api/utils';
import { LocalInfo } from '../api/settings';

type OptionalBool = boolean | undefined;
type PropertyNamesOfTypeS<T, S> = { [K in keyof T]: T[K] extends S ? K : never }[keyof T];
type BooleanKeyOfLocalInfo = Exclude<PropertyNamesOfTypeS<LocalInfo, OptionalBool>, undefined>;


export function checkboxLocalInfo(appState: AppState, local: LocalInfo, index: number, field: BooleanKeyOfLocalInfo) {
    return <Checkbox
        checked={!!local[field]}
        indeterminate={local[field] === undefined}
        onChange={(e) => {
            const v = e.target.indeterminate ? undefined : e.target.checked;
            appState.settings.locals[index][field] = v;
        }}
        initRipple={() => {}}
    ></Checkbox>;
}

export class LanguagePanel extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const settings = appState.settings;
        const checkbox = (local: LocalInfo, index: number, field: BooleanKeyOfLocalInfo) =>
            checkboxLocalInfo(appState, local, index, field);
        const locals = settings.locals.map((local, index) => <Row key={index}>
            <Cell columns={3}>{local.name}</Cell>
            <Cell columns={3}>{local.dictionaries.join(', ')}</Cell>
            <Cell columns={2}>
                {checkbox(local, index, 'isInUserSettings')}
            </Cell>
            <Cell columns={2}>
                {checkbox(local, index, 'isInWorkspaceSettings')}
            </Cell>
            <Cell columns={1}>
                {checkbox(local, index, 'isInFolderSettings')}
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
