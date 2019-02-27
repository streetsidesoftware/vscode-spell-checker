import * as React from 'react';
import {observer} from 'mobx-react';
// import DevTools from 'mobx-react-devtools';
import Button from '@material/react-button';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import {VsCodeWebviewApi} from '../../api/vscode/VsCodeWebviewApi';
import {AppState, Tab as AppTab} from '../AppState';
import { LanguagePanel } from './panelLanguage';
import { PanelConfig } from './panelConfig';
import { isConfigTarget } from '../../api/settings';
import { PanelDictionaries } from './panelDictionaries';

const vsCodeApi = new VsCodeWebviewApi();

@observer
export class SettingsViewer extends React.Component<{appState: AppState}, {}> {
    render() {
        const renderTab = (tab: AppTab, index: number) =>
            <div key={tab.label} className={appState.activeTabIndex === index ? 'panel active' : 'panel'}>
                {isConfigTarget(tab.target)
                    ? <PanelConfig appState={appState} target={tab.target}></PanelConfig>
                    : tab.target === 'languages' ? <LanguagePanel appState={appState}></LanguagePanel>
                    : tab.target === 'dictionaries' ? <PanelDictionaries appState={appState}></PanelDictionaries>
                    : <div></div>
                }
            </div>;
        const appState = this.props.appState;
        const activeTabIndex = appState.activeTabIndex || 0;
        return (
            <div>
                <TabBar
                    activeIndex={activeTabIndex}
                    handleActiveIndexUpdate={this.activateTab}
                >
                    {appState.tabs.map((tab, index) =>
                        <Tab key={index}>
                            <span className="mdc-tab__text-label">{tab.label}</span>
                        </Tab>
                    )}
                </TabBar>

                {appState.tabs.map(renderTab)}

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
                <h2>{appState.activeTab.label}</h2>
                <h2>{appState.counter}</h2>
                {appState.activeTabIndex}
                {/* <DevTools /> */}
            </div>
        );
     }

     activateTab = (activeIndex: number) => {
        this.props.appState.activeTabIndex = activeIndex;
     }

     onReset = () => {
         this.props.appState.resetTimer();
         vsCodeApi.postMessage({ command: 'RequestConfigurationMessage'});
     }
}
