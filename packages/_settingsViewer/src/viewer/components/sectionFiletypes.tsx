import * as React from 'react';
import { AppState } from '../AppState';
import { ConfigTarget } from '../../api/settings';
import Chip from '@material-ui/core/Chip';
import IconBlock from '@material-ui/icons/Block';
import IconCheck from '@material-ui/icons/Check';
import IconCheckbox from '@material-ui/icons/CheckBox';
import IconCheckboxEmpty from '@material-ui/icons/CheckBoxOutlineBlank';

export class SectionFiletypes extends React.Component<{appState: AppState; target: ConfigTarget}, {}> {
    render() {
        const appState = this.props.appState;
        const target = this.props.target;
        const config = appState.settings.configs[target];
        if (!config) {
            return <div></div>
        }
        const setOfEnabledIds = new Set(config.languageIdsEnabled);
        const inherited = config.inherited.languageIdsEnabled;
        const note = inherited && inherited !== target ? <span style={{ fontSize: '0.65em', opacity: 0.5}}>inherited from {inherited}</span> : '';
        return (
            <div>
                <h2>File Types and Programming Languages {note}</h2>
                <div>
                    {appState.settings.knownLanguageIds.map(langId => (
                        <Chip
                            variant={setOfEnabledIds.has(langId) ? 'default' : 'outlined'}
                            icon={setOfEnabledIds.has(langId) ? (<IconCheck/>) : undefined}
                            key={langId} id={langId} label={langId}
                            onClick={() => this.handleSelect(langId, !setOfEnabledIds.has(langId))}
                            clickable
                        />
                    ))}
                </div>
            </div>
        );
    }

    handleSelect(langId: string, selected: boolean) {
        const target = this.props.target;
        const config = this.props.appState.settings.configs[target];
        const enabled = config.languageIdsEnabled.includes(langId);
        if (enabled !== selected) {
            this.props.appState.actionEnableLanguageId(langId, selected, target)
        }
    }
}
