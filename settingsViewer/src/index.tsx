import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';

require('material-design-lite');
require('material-design-lite/material.css');


class AppState {
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
        return (
            <div>
                <button onClick={this.onReset}>
                    Seconds passed: {this.props.appState.timer}
                </button>
                <DevTools />
            </div>
        );
     }

     onReset = () => {
         this.props.appState.resetTimer();
     }
}

const appState = new AppState();
ReactDOM.render(<TimerView appState={appState} />, document.getElementById('root'));
