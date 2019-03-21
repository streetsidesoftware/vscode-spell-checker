import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable, toJS, computed} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import Button from '@material/react-button';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import { ConfigurationChangeMessage, SelectTabMessage, SelectFolderMessage, SelectFileMessage } from '../api/message';
import { VsCodeWebviewApi } from '../api/vscode/VsCodeWebviewApi';
import { Settings, ConfigTarget, WorkspaceFolder, TextDocument } from '../api/settings';
import { MessageBus } from '../api';
import { sampleSettings } from '../test/samples/sampleSettings';
// import dcopy from 'deep-copy'; // Does not work because there isn't really a default.
const dcopy: <T>(v: T)=>T = require('deep-copy');

require('./app.scss');

class AppState {
    @observable settings: Settings = dcopy(sampleSettings);
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
                    <Row>
                        <Cell columns={2}>
                            Scope
                        </Cell>
                        <Cell columns={10}>
                            Value
                        </Cell>
                    </Row>
                    {localDisplay.map(([field, name]) => <Row id={field}>
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
                </div>
                <div>
                    <Button
                        raised
                        className="button-alternate"
                        onClick={this.onUpdateConfig}
                    >
                        Update
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
    appState.settings.configs.file = {
        ...doc,
        dictionaries: dictionaries.filter(dic => dic.languageIds.includes(languageId)),
    };
}

messageBus.listenFor(
    'ConfigurationChangeMessage',
    (msg: ConfigurationChangeMessage) => {
        appState.settings = msg.value.settings;
    }
);

messageBus.listenFor(
    'SelectTabMessage',
    (msg: SelectTabMessage) => {
        appState.activeTab = msg.value;
    }
);

messageBus.listenFor(
    'SelectFolderMessage',
    (msg: SelectFolderMessage) => {
        appState.settings.activeFolderUri = msg.value;
    }
);

messageBus.listenFor(
    'SelectFileMessage',
    (msg: SelectFileMessage) => {
        appState.settings.activeFileUri = msg.value;
        calcFileConfig();
        postSettings();
    }
);
