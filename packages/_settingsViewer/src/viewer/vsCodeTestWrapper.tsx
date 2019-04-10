import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable, toJS, computed} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import Button from '@material/react-button';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import { ConfigurationChangeMessage, SelectTabMessage, SelectFolderMessage, SelectFileMessage, EnableLanguageIdMessage } from '../api/message';
import { VsCodeWebviewApi } from '../api/vscode/VsCodeWebviewApi';
import { Settings, ConfigTarget, WorkspaceFolder, TextDocument, Config } from '../api/settings';
import { MessageBus } from '../api';
import { sampleSettings, sampleSettingsSingleFolder } from '../test/samples/sampleSettings';
import { extractConfig } from '../api/settings/settingsHelper';
// import dcopy from 'deep-copy'; // Does not work because there isn't really a default.
const dcopy: <T>(v: T)=>T = require('deep-copy');

require('./app.scss');

class AppState {
    @observable currentSample: number = 0;
    sampleSettings: Settings[] = [sampleSettings, sampleSettingsSingleFolder];
    @observable settings: Settings = this.sampleSettings[this.currentSample];
    @observable activeTab: string = 'About';
    @computed get activeFolder(): WorkspaceFolder | undefined {
        const folders = this.workspaceFolders;
        const uri = this.activeFolderUri;
        return folders.filter(f => f.uri === uri)[0];
    }
    @computed get workspaceFolders(): WorkspaceFolder[] {
        const workspace = this.settings.workspace;
        return workspace && workspace.workspaceFolders || [];
    }
    @computed get activeFolderUri(): string | undefined {
        return this.settings.activeFolderUri;
    }
    @computed get activeFileUri(): string | undefined {
        return this.settings.activeFileUri;
    }
    @computed get activeDocument(): TextDocument | undefined {
        const uri = this.activeFileUri;
        return this.workspaceDocuments.filter(d => d.uri === uri)[0];
    }
    @computed get workspaceDocuments(): TextDocument[] {
        const workspace = this.settings.workspace;
        return workspace && workspace.textDocuments || [];
    }

    @computed get enabledLanguageIds(): string[] {
        const cfg = extractConfig(this.settings.configs, 'languageIdsEnabled');
        return cfg.config || [];
    }

    nextSample() {
        this.sampleSettings[this.currentSample] = toJS(this.settings);
        this.currentSample = (this.currentSample + 1) % this.sampleSettings.length;
        this.settings = this.sampleSettings[this.currentSample];
    }
}

const localDisplay: [ConfigTarget, string][] = [
    ['user', 'Global'],
    ['workspace', 'Workspace'],
    ['folder', 'Folder'],
];

@observer
class VsCodeTestWrapperView extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const settings = appState.settings;
        const getLocals = (target: ConfigTarget) => {
            const config = settings.configs[target];
            if (!config) return '-';
            return (config.locals || ['-']).join(', ');
        }
        return (
            <div>
                <h2>Locals</h2>
                <Grid>
                    <Row key='title'>
                        <Cell columns={2}>
                            Scope
                        </Cell>
                        <Cell columns={10}>
                            Value
                        </Cell>
                    </Row>
                    {localDisplay.map(([field, name]) => <Row key={field}>
                        <Cell columns={2}>{name}</Cell>
                        <Cell columns={10}>{getLocals(field)}</Cell>
                    </Row>)}

                </Grid>
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
                    <Button
                        raised
                        className="button-alternate"
                        onClick={this.onUpdateConfig}
                    >
                        Toggle Single / Multi Folder Workspace
                    </Button>
                </div>
                <div>
                    <pre>{JSON.stringify(toJS(appState.settings), null, 2)}</pre>
                </div>
                <DevTools />
            </div>
        );
     }

     onUpdateConfig = () => {
         console.log('onUpdateConfig');
         this.props.appState.nextSample();
         postSettings();
     }
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

messageBus.listenFor( 'RequestConfigurationMessage', postSettings );

function postSettings() {
    messageBus.postMessage({
        command: 'ConfigurationChangeMessage',
        value: {
            activeTab: toJS(appState.activeTab),
            settings: toJS(appState.settings),
        }
    });
}

function calcFileConfig() {
    const uri = appState.activeFileUri;
    const doc = appState.workspaceDocuments.filter(doc => doc.uri === uri)[0];
    if (!doc) { return; }
    const languageId = doc.languageId;
    const dictionaries = appState.settings.dictionaries;
    const languageEnabled = appState.enabledLanguageIds.includes(languageId);
    appState.settings.configs.file = {
        ...doc,
        fileEnabled: true,
        languageEnabled,
        dictionaries: dictionaries.filter(dic => dic.languageIds.includes(languageId)),
    };
}

messageBus.listenFor(
    'ConfigurationChangeMessage',
    (msg: ConfigurationChangeMessage) => {
        console.log(`ConfigurationChangeMessage`);
        appState.settings = msg.value.settings;
    }
);

messageBus.listenFor(
    'SelectTabMessage',
    (msg: SelectTabMessage) => {
        console.log(`SelectTabMessage`);
        appState.activeTab = msg.value;
    }
);

messageBus.listenFor(
    'SelectFolderMessage',
    (msg: SelectFolderMessage) => {
        console.log(`SelectFolderMessage`);
        appState.settings.activeFolderUri = msg.value;
    }
);

messageBus.listenFor(
    'SelectFileMessage',
    (msg: SelectFileMessage) => {
        console.log(`SelectFileMessage`);
        appState.settings.activeFileUri = msg.value;
        calcFileConfig();
        postSettings();
    }
);

messageBus.listenFor(
    'EnableLanguageIdMessage',
    (msg: EnableLanguageIdMessage) => {
        console.log(`EnableLanguageIdMessage`);
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
        appState.settings.configs[target] = { ...config, languageIdsEnabled };
        calcFileConfig();
        postSettings();
    }
);