import * as React from 'react';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import List, {ListItem, ListItemText, ListItemGraphic, ListItemMeta} from '@material/react-list';
import MaterialIcon from '@material/react-material-icon';
import { AppState } from './AppState';


export class PanelDictionaries extends React.Component<{appState: AppState}, {}> {
    render() {
        const dictionaries = this.props.appState.settings.dictionaries;
        // const dict0 = dictionaries.slice(0, Math.floor(dictionaries.length / 3));
        // const dict1 = dictionaries.slice(Math.floor(dictionaries.length / 3), Math.floor(dictionaries.length * 2 / 3));
        // const dict2 = dictionaries.slice(Math.floor(dictionaries.length * 2 / 3));
        const cols = [dictionaries]; // [dict0, dict1, dict2];
        return (
            <Grid>
                <Row>
                    <Cell><h3>Dictionaries</h3></Cell>
                </Row>
                <Row>
                    {cols.map((col, index) =>
                    <Cell columns={8} key={index}>
                        <List twoLine>
                            {col.map(dict =>
                            <ListItem key={dict.name}>
                                <ListItemGraphic graphic={<MaterialIcon icon='import_contacts'/>} />
                                <ListItemText primaryText={dict.name} secondaryText={dict.description} />
                                {/*<ListItemMeta meta={<MaterialIcon icon='check_circle'/>} />*/}
                            </ListItem>
                            )}
                        </List>
                    </Cell>)}
                </Row>
            </Grid>
        );
     }
}

