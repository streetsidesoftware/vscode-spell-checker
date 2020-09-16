import * as React from 'react';
import {observer, useAsObservableSource} from 'mobx-react';
import { DictionaryEntry } from '../../api/settings';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconCode from '@material-ui/icons/Code';
import IconSelectAll  from '@material-ui/icons/SelectAll';
import IconImportContacts  from '@material-ui/icons/ImportContacts';
import { listStyles } from './primitives';

export const SectionDictionaries = observer(_SectionDictionaries);
function _SectionDictionaries(props: {dictionaries: DictionaryEntry[]; sectionTitle?: string}) {
    const p = useAsObservableSource(props);
    const dictionaries = p.dictionaries;
    const title = p.sectionTitle || 'Dictionaries';
    const useStyles = listStyles();
    return (
        <div>
            <h2>{title}</h2>
            <List classes={useStyles}>
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
