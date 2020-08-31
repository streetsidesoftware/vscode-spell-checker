import * as React from 'react';
import {observer} from 'mobx-react';
import { DictionaryEntry } from '../../api/settings';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconCode from '@material-ui/icons/Code';
import IconSelectAll  from '@material-ui/icons/SelectAll';
import IconImportContacts  from '@material-ui/icons/ImportContacts';

@observer
export class SectionDictionaries extends React.Component<{dictionaries: DictionaryEntry[]; sectionTitle?: string}, {}> {
    render() {
        const dictionaries = this.props.dictionaries;
        const title = this.props.sectionTitle || 'Dictionaries';
        return (
            <div>
                <h2>{title}</h2>
                <List>
                    {dictionaries.map((dict, index) => {
                        const hasLocales = dict.locales && dict.locales.length > 0;
                        const hasFileTypes = dict.languageIds && dict.languageIds.length > 0;
                        const icon = hasFileTypes
                            ? <IconCode/>
                            : hasLocales ? <IconImportContacts/>
                            : <IconSelectAll/>;
                        return (
                        <ListItem key={'dict-' + index}>
                            <ListItemIcon>{icon}</ListItemIcon>
                            <ListItemText primary={dict.name} secondary={dict.description} />
                            <ListItemSecondaryAction>
                            {dict.locales.join(', ')}
                            </ListItemSecondaryAction>
                        </ListItem>
                        )
                    })}
                </List>
            </div>
        );
     }
}
