import * as React from 'react';
import { observer } from 'mobx-react';
// import DevTools from 'mobx-react-devtools';
import { AppState, Tab as AppTab } from '../AppState';
import { PanelConfig } from './panelConfig';
import { isConfigTarget } from '../../api/settings/settingsHelper';
import { PanelDictionaries } from './panelDictionaries';
import { PanelAbout } from './panelAbout';
import { PanelFile } from './panelFile';
import { CsTabs as Tabs, CsTab as Tab, CsAppBar as AppBar, themeDefault } from './primitives';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Panel } from './Panel';

@observer
export class SettingsViewer extends React.Component<{ appState: AppState }> {
    render(): JSX.Element {
        const appState = this.props.appState;
        const activeTabIndex = appState.activeTabIndex || 0;
        const renderTab = (tab: AppTab, index: number) => (
            <Panel key={tab.label} className={appState.activeTabIndex === index ? 'panel active' : 'panel'}>
                {isConfigTarget(tab.target) ? (
                    <PanelConfig appState={appState} target={tab.target}></PanelConfig>
                ) : tab.target === 'file' ? (
                    <PanelFile appState={appState}></PanelFile>
                ) : tab.target === 'dictionaries' ? (
                    <PanelDictionaries appState={appState}></PanelDictionaries>
                ) : tab.target === 'about' ? (
                    <PanelAbout appState={appState}></PanelAbout>
                ) : (
                    <div></div>
                )}
            </Panel>
        );

        const handleChange = (_event: React.ChangeEvent<any>, newValue: any) => {
            if (typeof newValue !== 'number') return;
            this.activateTab(newValue);
        };

        return (
            <ThemeProvider theme={themeDefault}>
                <CssBaseline />
                <AppBar position="fixed">
                    <Tabs
                        value={activeTabIndex}
                        onChange={handleChange}
                        aria-label="settings tabs"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {appState.tabs.map((tab, index) => (
                            <Tab key={index} label={tab.label} />
                        ))}
                    </Tabs>
                </AppBar>
                <div>{appState.tabs.map(renderTab)}</div>
            </ThemeProvider>
        );
    }

    activateTab: (activeIndex: number) => void = (activeIndex: number) => {
        this.props.appState.actionActivateTabIndex(activeIndex);
    };
}
