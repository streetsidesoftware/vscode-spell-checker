import { AppState } from '../../viewer/AppState';
import { MessageBus, Message, isMessage } from '../../api';
import { WebviewApi } from '../../api/WebviewApi';
import { sampleSettings } from '../samples/sampleSettings';
// import dcopy from 'deep-copy'; // Does not work because there isn't really a default.
const dcopy: <T>(v: T)=>T = require('deep-copy');

export class AppStateFixture extends AppState {
    _webviewApi: WebviewApi;
    _postedMessages: Message[];

    constructor() {
        const webviewApi: WebviewApi = {
            postMessage: (msg: any) => {
                isMessage(msg) && this._postedMessages.push(msg);
                return webviewApi
            },
            onmessage: undefined,
        };
        super(new MessageBus(webviewApi));
        this._webviewApi = webviewApi;
        this._postedMessages = [];
    }
}

export function sampleAppState(): AppStateFixture {
    const appState = new AppStateFixture();
    appState.settings = dcopy(sampleSettings);
    return appState;
}
