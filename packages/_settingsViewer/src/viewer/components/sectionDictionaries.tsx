import * as React from 'react';
import {observer} from 'mobx-react';
import List, {ListItem, ListItemText, ListItemGraphic, ListItemMeta} from '@material/react-list';
import MaterialIcon from '@material/react-material-icon';
import { DictionaryEntry } from '../../api/settings';


@observer
export class SectionDictionaries extends React.Component<{dictionaries: DictionaryEntry[], sectionTitle?: string}, {}> {
    render() {
        const dictionaries = this.props.dictionaries;
        const title = this.props.sectionTitle || 'Dictionaries';
        return (
            <div>
                <h2>{title}</h2>
                <List twoLine className='dictionary_list'>
                    {dictionaries.map(dict => {
                        const hasLocales = dict.locales && dict.locales.length > 0;
                        const hasFileTypes = dict.languageIds && dict.languageIds.length > 0;
                        const icon = hasFileTypes
                            ? 'code'
                            : hasLocales ? 'import_contacts'
                            : 'select_all';
                        return (
                        <ListItem key={dict.name}>
                            <ListItemGraphic graphic={<MaterialIcon icon={icon}/>} />
                            <ListItemText primaryText={dict.name} secondaryText={dict.description} />
                            <ListItemMeta meta={dict.locales.join(', ')} />
                        </ListItem>);
                    })}
                </List>
            </div>
        );
     }
}
