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
        const langs = appState.languageConfig[target];
        if (!langs) {
            return <div></div>
        }
        return (
            <Grid>
                <Row>
                    <Cell><h3>Language</h3></Cell>
                </Row>
                <Row>
                    <Cell columns={8}>
                        <List twoLine>
                            {langs.map(entry => {
                                const hasLocals = entry.dictionaries && entry.dictionaries.length > 0;
                                const icon = hasLocals ? 'import_contacts' : 'code';
                                return (
                                <ListItem key={entry.name}>
                                    <ListItemGraphic graphic={<MaterialIcon icon={icon}/>} />
                                    <ListItemText primaryText={entry.name} secondaryText={entry.dictionaries.join(', ')} />
                                    {/* <ListItemMeta meta={<Checkbox/>} /> */}
                                </ListItem>);

                            })}
                        </List>
                    </Cell>
                </Row>
            </Grid>
        );
     }
}
