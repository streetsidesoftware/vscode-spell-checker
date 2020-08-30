import * as React from 'react';
import {observer} from 'mobx-react';
// import DevTools from 'mobx-react-devtools';
import { Tab, TabBar } from '@rmwc/tabs';
import { AppState, Tab as AppTab} from '../AppState';
import { PanelConfig } from './panelConfig';
import { isConfigTarget } from '../../api/settings/settingsHelper';
import { PanelDictionaries } from './panelDictionaries';
import { PanelAbout } from './panelAbout';
import { PanelFile } from './panelFile';
import { ThemeProvider } from '@rmwc/theme';

// import '@rmwc/theme/styles';
import '@rmwc/tabs/styles';

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
        return (
            <ThemeProvider
            className={'cspell'}
            options={{
                primary: 'var(--cspell-primary)',
                onPrimary: 'var(--cspell-on-primary)',
                secondary: 'var(--cspell-secondary)',
                onSecondary: 'var(--cspell-on-secondary)',
                background: 'var(--cspell-background)',
                textPrimaryOnBackground: 'var(--cspell-foreground)',
                surface: 'var(--cspell-secondary)',
            }}
            >
                <div style={{ backgroundColor: 'var(--mdc-theme-background)' }}>
                    <TabBar
                        activeTabIndex={activeTabIndex}
                        onActivate={evt => this.activateTab(evt.detail.index)}
                    >
                        {appState.tabs.map((tab, index) =>
                            <Tab key={index}>{tab.label}</Tab>
                        )}
                    </TabBar>
                    <div>
                        {appState.tabs.map(renderTab)}
                    </div>
                </div>
            </ThemeProvider>
        );
     }

     activateTab = (activeIndex: number) => {
        this.props.appState.actionActivateTabIndex(activeIndex);
     }
}
