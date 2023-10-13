import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconCode from '@material-ui/icons/Code';
import IconImportContacts from '@material-ui/icons/ImportContacts';
import IconSelectAll from '@material-ui/icons/SelectAll';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import type { DictionaryEntry } from 'webview-api';

import { VsCodeWebviewApi } from '../../api/vscode/VsCodeWebviewApi';
import { clickLink } from '../../helpers/link';
import { listStyles } from './primitives';

const vsCodeApi = new VsCodeWebviewApi();

export const SectionDictionaries = observer(_SectionDictionaries);
function _SectionDictionaries({ dictionaries, sectionTitle }: { dictionaries: DictionaryEntry[]; sectionTitle?: string }) {
    const title = sectionTitle || 'Dictionaries';
    const useStyles = listStyles();
    return (
        <div>
            <h2>{title}</h2>
            <List classes={useStyles}>
                {dictionaries.map((dict, index) => {
                    const hasLocales = dict.locales && dict.locales.length > 0;
                    const hasFileTypes = dict.languageIds && dict.languageIds.length > 0;
                    const icon = hasFileTypes ? <IconCode /> : hasLocales ? <IconImportContacts /> : <IconSelectAll />;
                    return (
                        <ListItem key={'dict-' + index}>
                            <ListItemIcon>{icon}</ListItemIcon>
                            <ListItemText primary={dict.name} secondary={secondaryLine(dict)} />
                            <ListItemSecondaryAction>{dict.locales.join(', ')}</ListItemSecondaryAction>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );
}

function secondaryLine(dict: DictionaryEntry) {
    const { description, uri, uriName } = dict;

    const link = uriName ? (
        <Link href={uri} onClick={click}>
            {uriName}
        </Link>
    ) : undefined;

    return (
        <React.Fragment>
            {description && link ? (
                <React.Fragment>
                    {description}
                    <br />
                    {link}
                </React.Fragment>
            ) : description ? (
                description
            ) : (
                link
            )}
        </React.Fragment>
    );
}

function click(event: React.MouseEvent<HTMLAnchorElement>) {
    clickLink(vsCodeApi, event);
}
