import * as React from 'react';
import {observer} from 'mobx-react';
import { AppState } from '../AppState';
import { ConfigTarget } from '../../api/settings';
import Checkbox from '@material-ui/core/Checkbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconBlock from '@material-ui/icons/Block';
import IconImportContacts  from '@material-ui/icons/ImportContacts';

@observer
export class SectionLanguage extends React.Component<{appState: AppState; target: ConfigTarget}, {}> {
    render() {
        // const handleSelect = (index) => this.handleSelect(index);
        const target = this.props.target;
        const langConfig = this.props.appState.languageConfig[target];
        const inherited = langConfig.inherited;
        const note = inherited && inherited !== target ? <span style={{ fontSize: '0.65em', opacity: 0.5}}>inherited from {inherited}</span> : '';
        return (
            <div>
                <h2>Language {note}</h2>
                <div>
                    <List>
                        {langConfig.languages.map((entry, index) => {
                            const hasLocales = entry.dictionaries && entry.dictionaries.length > 0;
                            const icon = hasLocales ? <IconImportContacts/> : <IconBlock/>;
                            const subText = entry.dictionaries.join(', ') || 'no dictionaries found';
                            return (
                            <ListItem key={'dict-' + index}>
                                <ListItemIcon>{icon}</ListItemIcon>
                                <ListItemText primary={entry.name} secondary={subText} />
                                <ListItemSecondaryAction>
                                <Checkbox checked={entry.enabled} />
                                </ListItemSecondaryAction>
                            </ListItem>
                            )
                        })}
                    </List>
                </div>
            </div>
        );
     }

     handleSelect(index: number) {
        const appState = this.props.appState;
        const target = this.props.target;
        const langConfig = appState.languageConfig[target];
        if (!langConfig) return;
        const langs = langConfig.languages;
        if (!langs) return;
        const lang = langs[index];
        if (!lang) return;
        this.props.appState.actionSetLocale(target, lang.code, !lang.enabled);
    }
}
