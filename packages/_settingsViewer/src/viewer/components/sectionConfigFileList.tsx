import * as React from 'react';
import {observer} from 'mobx-react-lite';
import { FileUri } from '../../api/settings';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import IconSettings from '@material-ui/icons/Settings';
import { listStyles } from './primitives';

export const SectionConfigFileList = observer(_SectionConfigFileList);
function _SectionConfigFileList({configFiles}: {configFiles: FileUri[]}) {
    const title = 'Config Files';
    const useStyles = listStyles();
    return (
        <div>
            <h2>{title}</h2>
            <List classes={useStyles}>
                {configFiles.map((fileUri) => {
                    const icon = <IconSettings/>;
                    return (
                    <ListItem key={fileUri}>
                        <ListItemIcon>{icon}</ListItemIcon>
                        <ListItemText primary={fileUri} />
                    </ListItem>
                    )
                })}
            </List>
        </div>
    );
}
