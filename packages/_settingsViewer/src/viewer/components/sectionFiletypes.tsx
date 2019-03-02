import * as React from 'react';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import { AppState } from '../AppState';
import { ConfigTarget } from '../../api/settings';

export class SectionFiletypes extends React.Component<{appState: AppState, target: ConfigTarget}, {}> {
    render() {
        const appState = this.props.appState;
        const target = this.props.target;
        const config = appState.settings.configs[target];
        if (!config) {
            return <div></div>
        }
        return (
            <div>
                <h2>File Types</h2>
                <div>
                    {config.fileTypesEnabled ? config.fileTypesEnabled.join(', ') : '- none -'}
                </div>
            </div>
        );
     }
}
