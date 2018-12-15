import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {reaction} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import Button from '@material/react-button';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import {VsCodeWebviewApi} from './vscode/VsCodeWebviewApi';
import {CatPanel} from './cat';
import { isUpdateCounterMessage, isConfigurationChangeMessage, isMessage } from './message';
import {AppState, tabLabels, cats} from './AppState';
import { LanguagePanel } from './panelLanguage';

require('./app.scss');

const vsCodeApi = new VsCodeWebviewApi();

const tabs = tabLabels.map(label => (
    <Tab>
        <span className="mdc-tab__text-label">{label}</span>
    </Tab>
));

@observer
class SettingsViewer extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const activeTabIndex = appState.activeTabIndex || 0;
        return (
            <div>
                <TabBar
                    activeIndex={activeTabIndex}
                    handleActiveIndexUpdate={this.activateTab}
                >
                    {tabs}
                </TabBar>

                <div className={appState.activeTabIndex === 0 ? 'panel active' : 'panel'}>
                    <LanguagePanel appState={appState}></LanguagePanel>
                </div>
                {cats.map((cat, index) => (
                    <div key={index.toString()} className={appState.activeTabIndex === (index + 1) ? 'panel active' : 'panel'}>
                        <CatPanel {...cat}></CatPanel>
                    </div>
                ))}
                <Button
                    raised
                    className="button-alternate"
                    onClick={this.onReset}
                >
                    Click Me!
                </Button>
                <Button
                    className="button-alternate"
                    onClick={this.onReset}
                >
                    Seconds passed: {appState.timer}
                </Button>
                <h2>{appState.activeTabIndex}</h2>
                <h2>{appState.counter}</h2>

                <DevTools />
            </div>
        );
     }

     activateTab = (activeIndex: number) => {
        this.props.appState.activeTabIndex = activeIndex;
     }

     onReset = () => {
         this.props.appState.resetTimer();
     }
}

const appState = new AppState();
reaction(() => appState.timer, value => vsCodeApi.postMessage({ command: 'UpdateCounter', value: value * 2 }));
ReactDOM.render(<SettingsViewer appState={appState} />, document.getElementById('root'));

vsCodeApi.onmessage = (msg: MessageEvent) => {
    const message = msg.data;

    if (!isMessage(message)) {
        return;
    }

    console.log(message.command);

    if (isUpdateCounterMessage(message)) {
        appState.counter = message.value;
        return;
    }

    if (isConfigurationChangeMessage(message)) {
        appState.config = message.value.config;
        return;
    }
};
