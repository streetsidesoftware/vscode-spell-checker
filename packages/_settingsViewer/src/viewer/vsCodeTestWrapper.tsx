import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { posix as Path } from 'path';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MessageBus } from '../api';
import {
    ConfigurationChangeMessage,
    EnableLanguageIdMessage,
    SelectFileMessage,
    SelectFolderMessage,
    SelectTabMessage,
} from '../api/message';
import { Config, ConfigFile, Configs, ConfigTarget, FileConfig, Settings, TextDocument, WorkspaceFolder } from '../api/settings';
import { extractConfig } from '../api/settings/settingsHelper';
import { VsCodeWebviewApi } from '../api/vscode/VsCodeWebviewApi';
import {
    sampleSettings,
    sampleSettingsSingleFolder,
    sampleSettingsExcluded,
    sampleSettingsExcludedNotInWorkspace,
    sampleSettingsGitignore,
    sampleSettingsBlocked,
} from '../test/samples/sampleSettings';
import { ErrorBoundary } from './components/ErrorBoundary';

class AppState {
    currentSample: number = 0;
    sampleSettings: Settings[] = [
        sampleSettings,
        sampleSettingsSingleFolder,
        sampleSettingsExcluded,
        sampleSettingsExcludedNotInWorkspace,
        sampleSettingsGitignore,
        sampleSettingsBlocked,
    ];
    _settings: Settings = this.sampleSettings[this.currentSample];
    _activeTab: string = 'About';

    constructor() {
        makeObservable(this, {
            _activeTab: observable,
            _settings: observable,
            currentSample: observable,
            sampleSettings: observable,
            nextSample: action,
            updateActiveFileUri: action,
            updateActiveFolderUri: action,
            updateActiveTab: action,
            updateConfigs: action,
            updateConfigsFile: action,
            updateSettings: action,
        });
    }

    @computed get settings(): Settings {
        return this._settings;
    }

    @computed get activeTab() {
        return this._activeTab;
    }

    updateActiveTab(tab: string) {
        this._activeTab = tab;
        return this._activeTab;
    }

    @computed get activeFolder(): WorkspaceFolder | undefined {
        const folders = this.workspaceFolders;
        const uri = this.activeFolderUri;
        return folders.filter((f) => f.uri === uri)[0];
    }
    @computed get workspaceFolders(): WorkspaceFolder[] {
        const workspace = this.settings.workspace;
        return (workspace && workspace.workspaceFolders) || [];
    }
    @computed get activeFolderUri(): string | undefined {
        return this.settings.activeFolderUri;
    }

    updateActiveFolderUri(fileUri: string | undefined) {
        this._settings.activeFolderUri = fileUri;
    }

    @computed get activeFileUri(): string | undefined {
        return this.settings.activeFileUri;
    }

    updateActiveFileUri(fileUri: string | undefined) {
        this._settings.activeFileUri = fileUri;
    }

    @computed get activeDocument(): TextDocument | undefined {
        const uri = this.activeFileUri;
        return this.workspaceDocuments.filter((d) => d.uri === uri)[0];
    }
    @computed get workspaceDocuments(): TextDocument[] {
        const workspace = this.settings.workspace;
        return (workspace && workspace.textDocuments) || [];
    }

    @computed get enabledLanguageIds(): string[] {
        const cfg = extractConfig(this.settings.configs, 'languageIdsEnabled');
        return cfg.config || [];
    }

    updateSettings(settings: Settings) {
        this._settings = settings;
    }

    nextSample() {
        this.sampleSettings[this.currentSample] = toJS(this.settings);
        this.currentSample = (this.currentSample + 1) % this.sampleSettings.length;
        this._settings = this.sampleSettings[this.currentSample];
    }

    updateConfigs<K extends keyof Configs>(key: K, value: Configs[K]): void {
        this._settings.configs[key] = value;
    }

    updateConfigsFile(file: FileConfig | undefined) {
        this.updateConfigs('file', file);
    }

    findMatchingSampleConfig(docUri: string): Configs | undefined {
        for (const sample of this.sampleSettings) {
            if (sample.activeFileUri === docUri) {
                return sample.configs;
            }
        }
        return undefined;
    }
}

const localeDisplay: [ConfigTarget, string][] = [
    ['user', 'Global'],
    ['workspace', 'Workspace'],
    ['folder', 'Folder'],
];

@observer
class VsCodeTestWrapperView extends React.Component<{ appState: AppState }> {
    render() {
        const appState = this.props.appState;
        const settings = appState.settings;
        const getLocales = (target: ConfigTarget) => {
            const config = settings.configs[target];
            if (!config) return '-';
            return (config.locales || ['-']).join(', ');
        };
        return (
            <ErrorBoundary>
                <h2>Locales</h2>
                <Table>
                    <TableHead key="title">
                        <TableRow>
                            <TableCell>Scope</TableCell>
                            <TableCell>Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {localeDisplay.map(([field, name]) => (
                            <TableRow key={field}>
                                <TableCell>{name}</TableCell>
                                <TableCell>{getLocales(field)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div>
                    <h2>Info</h2>
                    <div>Panel: {appState.activeTab}</div>
                    <div>
                        Active Folder:
                        <pre>{JSON.stringify(toJS(appState.activeFolder), null, 2)}</pre>
                    </div>
                    <div>
                        Active Document:
                        <pre>{JSON.stringify(toJS(appState.activeDocument), null, 2)}</pre>
                    </div>
                    <div>
                        File Config
                        <pre>{JSON.stringify(toJS(appState.settings.configs.file), null, 2)}</pre>
                    </div>
                </div>
                <div>
                    <Button variant="contained" color="primary" onClick={this.onUpdateConfig}>
                        Toggle Single / Multi Folder Workspace
                    </Button>
                </div>
                <div>
                    <pre>{JSON.stringify(toJS(appState.settings), null, 2)}</pre>
                </div>
            </ErrorBoundary>
        );
    }

    onUpdateConfig = () => {
        console.log('onUpdateConfig');
        this.props.appState.nextSample();
        postSettings();
    };
}

const appState = new AppState();
/*
reaction(
    () => toJS(appState.settings),
    value => (
        console.log('post ConfigurationChangeMessage'),

        vsCodeApi.postMessage({ command: 'ConfigurationChangeMessage', value: { settings: toJS(appState.settings) } });
    )
);
*/
ReactDOM.render(<VsCodeTestWrapperView appState={appState} />, document.getElementById('root'));

const messageBus = new MessageBus(new VsCodeWebviewApi());

messageBus.listenFor('RequestConfigurationMessage', postSettings);

function postSettings() {
    messageBus.postMessage({
        command: 'ConfigurationChangeMessage',
        value: {
            activeTab: toJS(appState.activeTab),
            settings: toJS(appState.settings),
        },
    });
}

function calcFileConfig() {
    const uri = appState.activeFileUri;
    const doc = appState.workspaceDocuments.filter((doc) => doc.uri === uri)[0];
    if (!doc) {
        return;
    }
    const languageId = doc.languageId;
    const dictionaries = appState.settings.dictionaries;
    const languageEnabled = appState.enabledLanguageIds.includes(languageId);
    const folderPath = Path.dirname(Path.dirname(doc.uri));
    const workspacePath = Path.dirname(folderPath);
    const config = appState.findMatchingSampleConfig(doc.uri);
    const useConfig: FileConfig = config?.file ?? {
        ...doc,
        fileEnabled: true,
        fileIsIncluded: true,
        fileIsExcluded: false,
        fileIsInWorkspace: true,
        excludedBy: undefined,
        languageEnabled,
        dictionaries: dictionaries.filter((dic) => dic.languageIds.includes(languageId)),
        configFiles: [cfgFile(folderPath, 'cspell.json'), cfgFile(workspacePath, 'cspell.config.json')],
        gitignoreInfo: config?.file?.gitignoreInfo,
        blockedReason: config?.file?.blockedReason,
    };

    appState.updateConfigsFile(useConfig);
}

function cfgFile(path: string, file: string): ConfigFile {
    return {
        uri: Path.join(path, file),
        name: [Path.basename(path), file].join('/'),
    };
}

messageBus.listenFor('ConfigurationChangeMessage', (msg: ConfigurationChangeMessage) => {
    console.log('ConfigurationChangeMessage');
    appState.updateSettings(msg.value.settings);
});

messageBus.listenFor('SelectTabMessage', (msg: SelectTabMessage) => {
    console.log('SelectTabMessage');
    appState.updateActiveTab(msg.value);
});

messageBus.listenFor('SelectFolderMessage', (msg: SelectFolderMessage) => {
    console.log('SelectFolderMessage');
    appState.updateActiveFolderUri(msg.value);
});

messageBus.listenFor('SelectFileMessage', (msg: SelectFileMessage) => {
    console.log('SelectFileMessage');
    appState.updateActiveFileUri(msg.value);
    calcFileConfig();
    postSettings();
});

messageBus.listenFor('EnableLanguageIdMessage', (msg: EnableLanguageIdMessage) => {
    console.log('EnableLanguageIdMessage');
    console.log(JSON.stringify(msg, null, 2));
    const foundConfig = extractConfig(appState.settings.configs, 'languageIdsEnabled');
    const { target = foundConfig.target, languageId, enable: enabled } = msg.value;
    const config: Config = appState.settings.configs[target];
    const ids = new Set(config.languageIdsEnabled || []);
    if (enabled) {
        ids.add(languageId);
    } else {
        ids.delete(languageId);
    }
    const languageIdsEnabled = [...ids].sort();
    appState.updateConfigs(target, { ...config, languageIdsEnabled });
    calcFileConfig();
    postSettings();
});
