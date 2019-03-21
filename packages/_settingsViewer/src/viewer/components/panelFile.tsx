import * as React from 'react';
import {observer} from 'mobx-react';
import { AppState } from '../AppState';
import Select from '@material/react-select';
import { toJS } from 'mobx';
import { SectionDictionaries } from './sectionDictionaries';

@observer
export class PanelFile extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const settings = appState.settings;
        const config = settings.configs.file;
        const dictionaries = config && config.dictionaries || [];
        const select = (elem: HTMLSelectElement) => elem && this.props.appState.actionSelectDocument(elem.value);
        return (
            <div>
                <h2>
                    File
                </h2>
                <Select className='select_folder'
                        label='File'
                        options={appState.documentSelection}
                        onChange={(evt) => select(evt.target as HTMLSelectElement)}
                        value={appState.activeFileUri}
                    />
                <SectionDictionaries dictionaries={dictionaries} sectionTitle='Active Dictionaries'></SectionDictionaries>
                {appState.debugMode ?
                    <div>
                        <pre>{JSON.stringify(toJS(config), null, 2)}</pre>
                    </div>
                : ''}
            </div>
        );
     }
}
