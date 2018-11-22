import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import Button from '@material/react-button';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import {Cell, Grid, Row} from '@material/react-layout-grid';

require('./app.scss');

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
        return (
            <div>
                <TabBar
                    activeIndex={appState.activeTabIndex || 0}
                    handleActiveIndexUpdate={this.activateTab}
                >
                    <Tab>
                        <span className="mdc-tab__text-label">One</span>
                    </Tab>
                    <Tab>
                        <span className="mdc-tab__text-label">Two</span>
                    </Tab>
                    <Tab>
                        <span className="mdc-tab__text-label">Three</span>
                    </Tab>
                </TabBar>

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
                <Grid>
                    <Row>
                        <Cell columns={4}>Tennis</Cell>
                        <Cell columns={4}>Cricket</Cell>
                        <Cell columns={4}>StarCraft</Cell>
                    </Row>
                    <Row>
                        <Cell desktopColumns={4} order={2} phoneColumns={4} tabletColumns={4}>Tennis</Cell>
                        <Cell desktopColumns={4} order={3} phoneColumns={4} tabletColumns={4}>Cricket</Cell>
                        <Cell desktopColumns={4} order={1} phoneColumns={4} tabletColumns={4}>StarCraft</Cell>
                    </Row>
                    <Row>
                        <Cell columns={4}>
                            <Row>
                                <Cell desktopColumns={8} phoneColumns={2} tabletColumns={5}>Tennis</Cell>
                                <Cell desktopColumns={4} phoneColumns={2} tabletColumns={3}>Cricket</Cell>
                            </Row>
                        </Cell>
                        <Cell columns={4}> - </Cell>
                        <Cell columns={4}> - </Cell>
                    </Row>
                </Grid>

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
