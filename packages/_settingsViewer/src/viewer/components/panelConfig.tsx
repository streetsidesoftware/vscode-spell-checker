import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { observer } from 'mobx-react';
import * as React from 'react';
import type { ConfigTarget } from 'webview-api';

import { ConfigTargets } from '../../api/settings/settingsHelper';
import type { AppState } from '../AppState';
import { CsFormControl as FormControl } from './primitives';
import { SectionFiletypes } from './sectionFiletypes';
import { SectionLanguage } from './sectionLanguage';

@observer
export class PanelConfig extends React.Component<{ appState: AppState; target: ConfigTarget }> {
    render(): JSX.Element {
        const appState = this.props.appState;
        const target = this.props.target;
        const settings = appState.settings;
        const config = settings.configs[target];
        const select = (elem: HTMLSelectElement) => elem && this.props.appState.actionSelectFolder(elem.value);
        if (!config) {
            return <div></div>;
        }
        return (
            <div>
                {target === ConfigTargets.folder ? (
                    <div>
                        <h2>Folder</h2>
                        <FormControl>
                            <InputLabel id="select-folder-label">Folder</InputLabel>
                            <Select
                                labelId="select-folder-label"
                                id="select-folder"
                                onChange={(evt) => select(evt.target as HTMLSelectElement)}
                                value={appState.activeWorkspaceFolder}
                            >
                                {appState.workspaceFolderNames.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        {name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                ) : (
                    ''
                )}
                <SectionLanguage appState={appState} target={target}></SectionLanguage>
                <SectionFiletypes appState={appState} target={target}></SectionFiletypes>
            </div>
        );
    }
}
