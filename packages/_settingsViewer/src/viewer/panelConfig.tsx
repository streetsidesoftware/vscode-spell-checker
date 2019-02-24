import * as React from 'react';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import { AppState } from './AppState';
import * as spellCheckIcon from './images/SpellCheck.xs.png';
import {tf} from '../api/utils';
import { LocalInfo } from './AppState';
import { LocalSetting, LocalId, ConfigTarget } from '../api/settings';

type LocalSettingField = keyof LocalSetting;


export class PanelConfig extends React.Component<{appState: AppState, target: ConfigTarget}, {}> {
    render() {
        const appState = this.props.appState;
        const target = this.props.target;
        const config = appState.settings.configs[target];
        if (!config) {
            return <div></div>
        }
        return (
            <Grid>
                <Row>
                    <Cell columns={12}>
                        <h3>Language</h3>
                        <div>
                        {config.locals ? config.locals.join(', ') : '- none -'}
                        </div>
                    </Cell>
                </Row>
                <Row>
                    <Cell columns={12}>
                        <h3>File Types</h3>
                        <div>
                        {config.fileTypesEnabled ? config.fileTypesEnabled.join(', ') : '- none -'}
                        </div>
                    </Cell>
                </Row>
            </Grid>
        );
     }
}
