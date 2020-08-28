import * as React from 'react';
import {observer} from 'mobx-react';
import { AppState } from '../AppState';
import { Select } from '@rmwc/select';
import { toJS } from 'mobx';
import { SectionDictionaries } from './sectionDictionaries';
import { List, ListItem, ListItemGraphic, ListItemText, ListItemMeta, ListItemPrimaryText, SimpleListItem } from '@rmwc/list';
import { Checkbox } from '@rmwc/checkbox';

@observer
export class PanelFile extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const settings = appState.settings;
        const config = settings.configs.file;
        const languageId = config && config.languageId || 'unknown';
        const languageEnabled = config && config.languageEnabled;
        const fileEnabled = config && config.fileEnabled;
        const dictionaries = config && config.dictionaries || [];
        const select = (elem: HTMLSelectElement) => elem && this.props.appState.actionSelectDocument(elem.value);
        return (
            <div>
                <h2>
                    File
                </h2>
                <Select className="select_folder"
                        label="File"
                        options={appState.documentSelection}
                        onChange={(evt) => select(evt.target as HTMLSelectElement)}
                        value={appState.activeFileUri}
                    />
                <h2>Settings</h2>
                {/*
                <Grid>
                    <Row>
                        <Cell columns={8}>
                        </Cell>
                    </Row>
                </Grid>
                */}
                        <List>
                            <SimpleListItem role="checkbox"
                                graphic="description"
                                text="File enabled"
                                meta={
                                <Checkbox
                                    disabled={true}
                                    checked={fileEnabled}
                                />
                                }
                            />
                            <ListItem role="checkbox" onClick={() => {
                                    this.enableLanguageId(!languageEnabled);
                                }}>
                                <ListItemGraphic icon="code" />
                                <ListItemText>
                                    <ListItemPrimaryText><label htmlFor="checkbox-language-enabled">{`Programming Language: ${languageId}`}</label></ListItemPrimaryText>
                                </ListItemText>
                                <ListItemMeta>
                                    <Checkbox
                                        id="checkbox-language-enabled"
                                        checked={languageEnabled}
                                    />
                                </ListItemMeta>
                            </ListItem>
                        </List>

                <SectionDictionaries dictionaries={dictionaries} sectionTitle="Active Dictionaries"></SectionDictionaries>
                {appState.debugMode ?
                    <div>
                        <pre>{JSON.stringify(toJS(config), null, 2)}</pre>
                    </div>
                : ''}
            </div>
        );
    }

    enableLanguageId(enable: boolean) {
        const config = this.props.appState.settings.configs.file;
        const languageId = config && config.languageId;
        if (languageId) {
            this.props.appState.actionEnableLanguageId(languageId, enable);
        }
    }
}
