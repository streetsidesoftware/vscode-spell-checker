import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconBlock from '@material-ui/icons/Block';
import IconImportContacts from '@material-ui/icons/ImportContacts';
import { observer } from 'mobx-react';
import * as React from 'react';
import type { ConfigTarget } from 'webview-api';

import type { AppState, LanguageInfo } from '../AppState';
import { CsCheckBox, CsList as List } from './primitives';

@observer
export class SectionLanguage extends React.Component<{ appState: AppState; target: ConfigTarget }> {
    render(): JSX.Element {
        const handleSelect = (index: LanguageInfo) => this.handleSelect(index);
        const target = this.props.target;
        const langConfig = this.props.appState.languageConfig[target];
        const inherited = langConfig.inherited;
        const note =
            inherited && inherited !== target ? <span style={{ fontSize: '0.65em', opacity: 0.5 }}>inherited from {inherited}</span> : '';
        return (
            <div>
                <h2>Language {note}</h2>
                <div>
                    <List>
                        {langConfig.languages.map((entry, index) => {
                            const hasLocales = entry.dictionaries && entry.dictionaries.length > 0;
                            const icon = hasLocales ? <IconImportContacts /> : <IconBlock />;
                            const text = (
                                <React.Fragment>
                                    {entry.name}
                                    <sup>
                                        <i>{entry.code}</i>
                                    </sup>
                                </React.Fragment>
                            );
                            const subText = 'Dictionary Names: ' + (entry.dictionaries.join(', ') || 'none found');
                            return (
                                <ListItem key={'dict-' + index} onClick={() => handleSelect(entry)}>
                                    <ListItemIcon>{icon}</ListItemIcon>
                                    <ListItemText primary={text} secondary={subText} />
                                    <ListItemSecondaryAction>
                                        <CsCheckBox checked={entry.enabled} onClick={() => handleSelect(entry)} />
                                    </ListItemSecondaryAction>
                                </ListItem>
                            );
                        })}
                    </List>
                </div>
            </div>
        );
    }

    handleSelect(lang: LanguageInfo): void {
        const target = this.props.target;
        this.props.appState.actionSetLocale(target, lang.code, !lang.enabled);
    }
}
