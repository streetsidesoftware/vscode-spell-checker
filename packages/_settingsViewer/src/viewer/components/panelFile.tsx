import InputLabel from '@material-ui/core/InputLabel';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Link from '@material-ui/core/Link';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import IconCode from '@material-ui/icons/Code';
import IconDescription from '@material-ui/icons/Description';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { FileConfig } from '../../api/settings';
import { AppState } from '../AppState';
import { LinkOpenFile } from './link';
import { CsCheckBox as Checkbox, CsFormControl as FormControl, CsList as List } from './primitives';
import { SectionConfigFileList } from './sectionConfigFileList';
import { SectionDictionaries } from './sectionDictionaries';

@observer
export class PanelFile extends React.Component<{ appState: AppState }> {
    render(): JSX.Element {
        const appState = this.props.appState;
        const settings = appState.settings;
        const config = settings.configs.file;
        const languageId = config?.languageId || 'unknown';
        const languageEnabled = config?.languageEnabled;
        const name = config?.uri.replace(/.*\//, '') || 'File';
        const dictionaries = config?.dictionaries || [];
        const configFiles = config?.configFiles || [];
        const select = (elem: HTMLSelectElement) => elem && this.props.appState.actionSelectDocument(elem.value);
        const onClick = () => {
            this.enableLanguageId(!languageEnabled);
        };
        return (
            <div>
                <h2>File</h2>
                <FormControl>
                    <InputLabel id="select-file-label">File</InputLabel>
                    <Select
                        labelId="select-file-label"
                        id="select-file"
                        value={appState.activeFileUri}
                        onChange={(evt) => select(evt.target as HTMLSelectElement)}
                    >
                        {appState.documentSelection.map((item) => (
                            <MenuItem value={item.value} key={item.value}>
                                {item.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <h2>Settings</h2>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <IconDescription />
                        </ListItemIcon>
                        <ListItemText primary={<i>{name}</i>} secondary={secondaryFileMessage(config)} />
                    </ListItem>
                    <ListItem role="checkbox" onClick={onClick}>
                        <ListItemIcon>
                            <IconCode />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <label htmlFor="checkbox-language-enabled">
                                    File Type: <i>{languageId}</i>
                                </label>
                            }
                        />
                        <ListItemSecondaryAction>
                            <Checkbox id="checkbox-language-enabled" checked={languageEnabled} onClick={onClick} />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
                <SectionConfigFileList configFiles={configFiles}></SectionConfigFileList>
                <SectionDictionaries dictionaries={dictionaries} sectionTitle="Active Dictionaries"></SectionDictionaries>
                {appState.debugMode ? (
                    <div>
                        <pre>{JSON.stringify(toJS(config), null, 2)}</pre>
                    </div>
                ) : (
                    ''
                )}
            </div>
        );
    }

    enableLanguageId(enable: boolean): void {
        const config = this.props.appState.settings.configs.file;
        const languageId = config && config.languageId;
        if (languageId) {
            this.props.appState.actionEnableLanguageId(languageId, enable);
        }
    }
}

function* br(...frags: React.ReactFragment[]) {
    if (!frags.length) return;
    let index = 0;
    for (const f of frags) {
        if (index++) {
            yield <br />;
        }
        yield f;
    }
}

function isDefined<T>(t: T | undefined): t is T {
    return t !== undefined;
}

function secondaryFileMessage(config: FileConfig | undefined): React.ReactFragment | undefined {
    if (!config) return undefined;

    const { fileIsInWorkspace, fileIsExcluded, fileIsIncluded, fileEnabled, gitignoreInfo, blockedReason } = config;
    const gitignored = !!gitignoreInfo?.matched;

    const excludedBy =
        config.excludedBy
            ?.map((e) => e.configUri && LinkOpenFile({ uri: e.configUri, text: e.name ? `${e.name} - "${e.glob}"` : `"${e.glob}"` } || '*'))
            .filter(isDefined) ?? [];

    const linkGitignore = formatGitignoreLink(gitignoreInfo);

    const messages = [
        [formatGitignoreMsg(gitignoreInfo), gitignored],
        [formatBlockedMsg(blockedReason), !!blockedReason],
        [linkGitignore, gitignored],
        ['File is excluded', fileIsInWorkspace && fileIsIncluded && fileIsExcluded],
        ['File is NOT in `files` to be checked.', fileIsInWorkspace && !fileIsIncluded],
        ['File is NOT in the workspace and excluded.', !fileIsInWorkspace && fileIsExcluded],
        ['File is NOT in the workspace.', !fileIsInWorkspace && !fileIsExcluded && fileEnabled],
        ['File is NOT spell checked because it is not in the workspace.', !fileIsInWorkspace && !fileIsExcluded && !fileEnabled],
    ] as const;

    const msg = messages
        .filter(([_, m]) => m)
        .map(([m]) => m)
        .filter(isDefined);
    return msg ? <div>{[...br(...msg, ...excludedBy)]}</div> : undefined;
}

function formatGitignoreLink(gitignore: FileConfig['gitignoreInfo']) {
    if (!gitignore) return undefined;

    const { gitignoreFileUri: uri, gitignoreName: name, line } = gitignore;

    return LinkOpenFile({ uri: uri, text: name, line });
}

function formatGitignoreMsg(gitignore: FileConfig['gitignoreInfo']) {
    if (!gitignore) return undefined;

    const { line, glob } = gitignore;

    return (
        <span>
            File is exclude by <b>.gitignore</b>. Line: <b>{line}</b>, Glob: <b>{glob}</b>
        </span>
    );
}

function formatBlockedMsg(blockedReason: FileConfig['blockedReason']) {
    if (!blockedReason) return undefined;

    const { message, documentationRefUri } = blockedReason;

    return (
        <span>
            {message} {documentationRefUri ? <Link href={documentationRefUri}>More Info...</Link> : undefined}
        </span>
    );
}
