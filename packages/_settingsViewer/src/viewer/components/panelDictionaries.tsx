import * as React from 'react';
import {observer} from 'mobx-react';
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
