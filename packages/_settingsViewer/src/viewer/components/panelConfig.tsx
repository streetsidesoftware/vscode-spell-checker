import * as React from 'react';
import {observer} from 'mobx-react';
import { AppState } from '../AppState';
import { ConfigTarget } from '../../api/settings';
import { ConfigTargets } from '../../api/settings/settingsHelper';
import { SectionLanguage } from './sectionLanguage';
import { SectionFiletypes } from './sectionFiletypes';
import Select from '@material/react-select';

@observer
export class PanelConfig extends React.Component<{appState: AppState, target: ConfigTarget}, {}> {
    render() {
        const appState = this.props.appState;
        const target = this.props.target;
        const settings = appState.settings;
        const config = settings.configs[target];
        const select = (elem: HTMLSelectElement) => elem && this.props.appState.actionSelectFolder(elem.value);
        if (!config) {
            return <div></div>
        }
        return (
            <div>
                {target === ConfigTargets.folder ?
                <div>
                    <h2>Folder</h2>
                    <Select className='select_folder'
                        label='Folder'
                        options={appState.workspaceFolderNames}
                        onChange={(evt) => select(evt.target as HTMLSelectElement)}
                        value={appState.activeWorkspaceFolder}
                    />
                </div>
                : ''}
                <SectionLanguage appState={appState} target={target}></SectionLanguage>
                <SectionFiletypes appState={appState} target={target}></SectionFiletypes>
            </div>
        );
     }
}
