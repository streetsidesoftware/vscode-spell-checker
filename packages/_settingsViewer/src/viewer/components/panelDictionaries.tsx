import * as React from 'react';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import List, {ListItem, ListItemText, ListItemGraphic, ListItemMeta} from '@material/react-list';
import MaterialIcon from '@material/react-material-icon';
import { AppState } from '../AppState';


export class PanelDictionaries extends React.Component<{appState: AppState}, {}> {
    render() {
        const dictionaries = this.props.appState.settings.dictionaries;
        return (
            <div>
                <h3>Dictionaries</h3>
                <List twoLine className='dictionary_list'>
                    {dictionaries.map(dict => {
                        const hasLocals = dict.locals && dict.locals.length > 0;
                        const hasFileTypes = dict.fileTypes && dict.fileTypes.length > 0;
                        const icon = hasFileTypes
                            ? 'code'
                            : hasLocals ? 'import_contacts'
                            : 'select_all';
                        return (
                        <ListItem key={dict.name}>
                            <ListItemGraphic graphic={<MaterialIcon icon={icon}/>} />
                            <ListItemText primaryText={dict.name} secondaryText={dict.description} />
                            <ListItemMeta meta={dict.locals.join(', ')} />
                        </ListItem>);
                    })}
                </List>
            </div>
        );
     }
}

