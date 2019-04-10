import * as React from 'react';
import { AppState } from '../AppState';
import { ConfigTarget } from '../../api/settings';
import { ChipSet, Chip } from '@material/react-chips';
import MaterialIcon from '@material/react-material-icon';

export class SectionFiletypes extends React.Component<{appState: AppState, target: ConfigTarget}, {}> {
    render() {
        const appState = this.props.appState;
        const target = this.props.target;
        const config = appState.settings.configs[target];
        if (!config) {
            return <div></div>
        }
        const setOfEnabledIds = new Set(config.languageIdsEnabled);
        return (
            <div>
                <h2>File Types and Programming Languages</h2>
                <div>
                    <ChipSet filter selectedChipIds={config.languageIdsEnabled} >
                        {appState.settings.knownLanguageIds.map(langId => (
                            <Chip
                                selected={setOfEnabledIds.has(langId)}
                                key={langId} id={langId} label={langId}
                                onClick={() => this.handleSelect(langId, !setOfEnabledIds.has(langId))}
                            />
                        ))}
                    </ChipSet>
                </div>
            </div>
        );
    }

    handleSelect(langId: string, selected: boolean) {
        const target = this.props.target;
        const config = this.props.appState.settings.configs[target];
        const enabled = config.languageIdsEnabled.includes(langId);
        console.log(`handle file type selection ${langId}, target: ${target}, selected: ${selected ? 'true': 'false'}, enabled: ${enabled ? 'true' : 'false'}`);
        if (enabled !== selected) {
            this.props.appState.actionEnableLanguageId(langId, selected, target)
        }
    }
}
