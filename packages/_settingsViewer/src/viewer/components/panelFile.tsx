import * as React from 'react';
import {observer} from 'mobx-react';
import { AppState } from '../AppState';
import { toJS } from 'mobx';
import { SectionDictionaries } from './sectionDictionaries';
import { CsCheckBox as Checkbox, CsList as List, CsFormControl as FormControl } from './primitives';
import IconDescription from '@material-ui/icons/Description';
import IconCode from '@material-ui/icons/Code';
import InputLabel from '@material-ui/core/InputLabel';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { SectionConfigFileList } from './sectionConfigFileList';


@observer
export class PanelFile extends React.Component<{appState: AppState}> {
    render(): JSX.Element {
        const appState = this.props.appState;
        const settings = appState.settings;
        const config = settings.configs.file;
        const languageId = config?.languageId || 'unknown';
        const languageEnabled = config?.languageEnabled;
        const fileEnabled = config?.fileEnabled;
        const dictionaries = config?.dictionaries || [];
        const configFiles = config?.configFiles || [];
        const select = (elem: HTMLSelectElement) => elem && this.props.appState.actionSelectDocument(elem.value);
        const onClick = () => {
            this.enableLanguageId(!languageEnabled);
        };
        return (
            <div>
                <h2>
                    File
                </h2>
                <FormControl>
                    <InputLabel id="select-file-label">File</InputLabel>
                    <Select
                        labelId="select-file-label"
                        id="select-file"
                        value={appState.activeFileUri}
                        onChange={(evt) => select(evt.target as HTMLSelectElement)}
                    >
                        {appState.documentSelection.map(item => (<MenuItem value={item.value} key={item.value}>{item.label}</MenuItem>))}
                    </Select>
                </FormControl>
                <h2>Settings</h2>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <IconDescription />
                        </ListItemIcon>
                        <ListItemText
                            primary="File enabled"
                        />
                        <ListItemSecondaryAction>
                            <Checkbox
                                disabled={true}
                                checked={fileEnabled}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem role="checkbox" onClick={onClick}>
                        <ListItemIcon>
                            <IconCode />
                        </ListItemIcon>
                        <ListItemText
                            primary={<label htmlFor="checkbox-language-enabled">{`Programming Language: ${languageId}`}</label>}
                        />
                        <ListItemSecondaryAction>
                            <Checkbox
                                id="checkbox-language-enabled"
                                checked={languageEnabled}
                                onClick={onClick}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
                <SectionConfigFileList configFiles={configFiles}></SectionConfigFileList>
                <SectionDictionaries dictionaries={dictionaries} sectionTitle="Active Dictionaries"></SectionDictionaries>
                {appState.debugMode ?
                    <div>
                        <pre>{JSON.stringify(toJS(config), null, 2)}</pre>
                    </div>
                : ''}
            </div>
        );
    }

    enableLanguageId(enable: boolean): void {
        const config = this.props.appState.settings.configs.file;
        const languageId = config && config.languageId;
        if (languageId) {
            this.props.appState.actionEnableLanguageId(languageId, enable);
        }
    }
}
