import * as React from 'react';
import {observer} from 'mobx-react';
import { AppState } from '../AppState';
import { ConfigTarget } from '../../api/settings';
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
        if (!config) {
            return <div></div>
        }
        const workspace = settings.workspace;
        const workspaceFolders = workspace && workspace.workspaceFolders || [];
        const options = workspaceFolders.map(folder => folder.name);
        return (
            <div>
                <Select className='select_folder'
                    label='Folder'
                    options={options}
                    value={options[0]}
                />
                <SectionLanguage appState={appState} target={target}></SectionLanguage>
                <SectionFiletypes appState={appState} target={target}></SectionFiletypes>
            </div>
        );
     }
}
