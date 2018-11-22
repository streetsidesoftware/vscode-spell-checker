import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import Button from '@material/react-button';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import { string } from 'prop-types';

require('./app.scss');

const cats = [
    { title: 'Coding Cat', image: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif'},
    { title: 'Compiling Cat', image: 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif'},
    { title: 'Testing Cat', image: 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'},
];

const tabs = cats.map(cat => (
    <Tab>
        <span className="mdc-tab__text-label">{cat.title}</span>
    </Tab>
));

class AppState {
    @observable activeTabIndex = 0;
    @observable timer = 0;

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
        const activeTab = appState.activeTabIndex || 0;
        return (
            <div>
                <TabBar
                    activeIndex={activeTab}
                    handleActiveIndexUpdate={this.activateTab}
                >
                    {tabs}
                </TabBar>

                {cats.map((cat, index) => (
                    <div className={appState.activeTabIndex === index ? 'panel active' : 'panel'}>
                        <Grid>
                            <Row>
                                <Cell columns={12}>
                                    <img
                                        src={cat.image}
                                        alt={cat.title}
                                        width="300"
                                    />
                                </Cell>
                            </Row>
                        </Grid>
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
ReactDOM.render(<TimerView appState={appState} />, document.getElementById('root'));
