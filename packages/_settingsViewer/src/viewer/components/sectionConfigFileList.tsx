import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import IconSettings from '@material-ui/icons/Settings';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import type { ConfigFile } from 'webview-api';

import { VsCodeWebviewApi } from '../../api/vscode/VsCodeWebviewApi';
import { clickLink } from '../../helpers/link';
import { listStyles } from './primitives';

const vsCodeApi = new VsCodeWebviewApi();

export const SectionConfigFileList = observer(_SectionConfigFileList);
function _SectionConfigFileList({ configFiles }: { configFiles: ConfigFile[] }) {
    const title = 'Config Files';
    const useStyles = listStyles();

    return (
        <div>
            <h2>{title}</h2>
            <List classes={useStyles}>
                {configFiles.map((cfgFile) => {
                    const icon = <IconSettings />;
                    const link = (
                        <Link href={cfgFile.uri} onClick={click}>
                            {cfgFile.name}
                        </Link>
                    );
                    return (
                        <ListItem key={cfgFile.uri}>
                            <ListItemIcon>{icon}</ListItemIcon>
                            <ListItemText primary={link} />
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );
}

function click(event: React.MouseEvent<HTMLAnchorElement>) {
    clickLink(vsCodeApi, event);
}
