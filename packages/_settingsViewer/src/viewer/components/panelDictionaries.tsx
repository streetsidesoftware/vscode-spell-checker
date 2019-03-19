import * as React from 'react';
import {observer} from 'mobx-react';
import List, {ListItem, ListItemText, ListItemGraphic, ListItemMeta} from '@material/react-list';
import MaterialIcon from '@material/react-material-icon';
import { AppState } from '../AppState';
import { SectionDictionaries } from './sectionDictionaries';


@observer
export class PanelDictionaries extends React.Component<{appState: AppState}, {}> {
    render() {
        const dictionaries = this.props.appState.settings.dictionaries;
        return (
            <SectionDictionaries dictionaries={dictionaries}></SectionDictionaries>
        );
     }
}

