import * as React from 'react';
import { AppState } from '../AppState';
import { ConfigTarget } from '../../api/settings';
import { ChipSet, Chip } from '@material/react-chips';

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
                <h2>File Types and Programming Languages</h2>
                <div>
                    <ChipSet
                        filter
                        selectedChipIds={config.languageIdsEnabled}
                    >
                        {appState.settings.knownLanguageIds.map((lang, index) => (
                            <Chip key={index} id={lang} label={lang}  />
                        ))}
                    </ChipSet>
                </div>
            </div>
        );
     }
}
