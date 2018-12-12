import * as React from 'react';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import { AppState } from './AppState';
import * as spellCheckIcon from './images/SpellCheck.xs.png';
import {tf} from './utils';

export class LanguagePanel extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const config = appState.config;
        return (
            <Grid>
                <Row>
                    <Cell columns={12}>
                        <img src={spellCheckIcon} />
                    </Cell>
                </Row>
                <Row>
                    <Cell columns={12}>
                        Language Enabled: {tf(config.languageEnabled)}
                    </Cell>
                </Row>
            </Grid>
        );
     }
}
