import * as React from 'react';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import { AppState } from '../AppState';
import { ConfigTarget } from '../../api/settings';
import List, { ListItem, ListItemGraphic, ListItemText, ListItemMeta } from '@material/react-list';
import MaterialIcon from '@material/react-material-icon';
import { Checkbox } from '@material/react-checkbox';

export class SectionLanguage extends React.Component<{appState: AppState, target: ConfigTarget}, {}> {
    render() {
        const appState = this.props.appState;
        const target = this.props.target;
        const langConfig = appState.languageConfig[target];
        const handleSelect = (index) => {
            console.log(`handelSelect ${index}`);
            if (!langConfig) return;
            const langs = langConfig.languages;
            if (!langs) return;
            const lang = langs[index];
            if (!lang) return;
            this.props.appState.setLocal(target, lang.code, !lang.enabled);
        };
        if (!langConfig) {
            return <div></div>
        }
        const inherited = langConfig.inherited;
        const note = inherited && inherited !== target ? <span style={{ fontSize: '0.65em', opacity: 0.5}}>inherited from {inherited}</span> : '';
        return (
            <div>
                <h3>Language {note}</h3>
                <div>
                    <List twoLine handleSelect={handleSelect}>
                        {langConfig.languages.map(entry => {
                            const hasLocals = entry.dictionaries && entry.dictionaries.length > 0;
                            const icon = hasLocals ? 'import_contacts' : 'block';
                            const checkbox = entry.enabled ? 'check_box' : 'check_box_outline_blank';
                            const subText = entry.dictionaries.join(', ') || 'no dictionaries found';
                            return (
                            <ListItem key={entry.name} role='checkbox'>
                                <ListItemGraphic graphic={<MaterialIcon icon={icon}/>} />
                                <ListItemText primaryText={entry.name} secondaryText={subText} />
                                <ListItemMeta meta={<MaterialIcon icon={checkbox}/>}/>
                            </ListItem>);

                        })}
                    </List>
                </div>
            </div>
        );
     }
}
