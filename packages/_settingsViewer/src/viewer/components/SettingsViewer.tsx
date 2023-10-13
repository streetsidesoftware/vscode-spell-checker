import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import { observer } from 'mobx-react';
import * as React from 'react';

import { isConfigTarget } from '../../api/settings/settingsHelper';
import type { AppState, Tab as AppTab } from '../AppState';
import { Panel } from './Panel';
import { PanelAbout } from './panelAbout';
import { PanelConfig } from './panelConfig';
import { PanelDictionaries } from './panelDictionaries';
import { PanelFile } from './panelFile';
import { CsAppBar as AppBar, CsTab as Tab, CsTabs as Tabs, themeDefault } from './primitives';

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
