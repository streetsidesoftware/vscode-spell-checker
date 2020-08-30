import * as React from 'react';
import {observer} from 'mobx-react';
import { AppState } from '../AppState';
import { ConfigTarget } from '../../api/settings';
import {List, SimpleListItem } from '@rmwc/list';
import { Checkbox } from '@rmwc/checkbox';

import '@rmwc/checkbox/styles';
import '@rmwc/list/styles';

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
                    <List twoLine>
                        {langConfig.languages.map(entry => {
                            const hasLocales = entry.dictionaries && entry.dictionaries.length > 0;
                            const icon = hasLocales ? 'import_contacts' : 'block';
                            const subText = entry.dictionaries.join(', ') || 'no dictionaries found';
                            const r = (
                            <SimpleListItem key={entry.name}
                                graphic={icon}
                                text={entry.name}
                                secondaryText={subText}
                                meta={<Checkbox checked={entry.enabled}/>}
                            />);
                            return r;

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
