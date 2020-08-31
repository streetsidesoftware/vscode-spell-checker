import * as React from 'react';
import {observer} from 'mobx-react';
// import DevTools from 'mobx-react-devtools';
import { AppState, Tab as AppTab} from '../AppState';
import { PanelConfig } from './panelConfig';
import { isConfigTarget } from '../../api/settings/settingsHelper';
import { PanelDictionaries } from './panelDictionaries';
import { PanelAbout } from './panelAbout';
import { PanelFile } from './panelFile';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';


@observer
export class SettingsViewer extends React.Component<{appState: AppState}, {}> {
    render() {
        const appState = this.props.appState;
        const activeTabIndex = appState.activeTabIndex || 0;
        const renderTab = (tab: AppTab, index: number) =>
            <div key={tab.label} className={appState.activeTabIndex === index ? 'panel active' : 'panel'}>
                {isConfigTarget(tab.target)
                    ? <PanelConfig appState={appState} target={tab.target}></PanelConfig>
                    : tab.target === 'file' ? <PanelFile appState={appState}></PanelFile>
                    : tab.target === 'dictionaries' ? <PanelDictionaries appState={appState}></PanelDictionaries>
                    : tab.target === 'about' ? <PanelAbout appState={appState}></PanelAbout>
                    : <div></div>
                }
            </div>;

        const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
            this.activateTab(newValue);
        };

        return (
            <div>
                <AppBar position="static">
                    <Tabs value={activeTabIndex} onChange={handleChange} aria-label="simple tabs example">
                        {appState.tabs.map((tab, index) =>
                            <Tab key={index} label={tab.label} />
                        )}
                    </Tabs>
                </AppBar>
                <div>
                    {appState.tabs.map(renderTab)}
                </div>
            </div>
        );
     }

     activateTab = (activeIndex: number) => {
        this.props.appState.actionActivateTabIndex(activeIndex);
     }
}
