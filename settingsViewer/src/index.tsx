import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable, reaction, computed} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import Button from '@material/react-button';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import {getVSCodeAPI} from './vscode/vscodeAPI';
import {CatPanel} from './cat';

require('./app.scss');

const cats = [
    { title: 'Coding Cat', image: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif', icon: 'home'},
    { title: 'Compiling Cat', image: 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif', icon: 'face'},
    { title: 'Testing Cat', image: 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif', icon: 'favorite'},
];

const tabLabels = ['Language'].concat(cats.map(cat => cat.title));

const tabs = tabLabels.map(label => (
    <Tab>
        <span className="mdc-tab__text-label">{label}</span>
    </Tab>
));

class AppState {
    @observable activeTabIndex = 0;
    @observable timer = 0;
    @computed get activeTab() {
        return tabLabels[this.activeTabIndex];
    }

    constructor() {
        setInterval(() => {
            this.timer += 1;
        }, 1000);
    }

    resetTimer() {
        this.timer = 0;
    }
}

@observer
class TimerView extends React.Component<{appState: AppState}, {}> {
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
                    className="foo-button"
                    onClick={this.onReset}
                >
                    Seconds passed: {appState.timer}
                </Button>
                <h2>{appState.activeTabIndex}</h2>

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
reaction(() => appState.timer, value => getVSCodeAPI().postMessage({ command: 'UpdateCounter', value: value * 2 }));
ReactDOM.render(<TimerView appState={appState} />, document.getElementById('root'));
