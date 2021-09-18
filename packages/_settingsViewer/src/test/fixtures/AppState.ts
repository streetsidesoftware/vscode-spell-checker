import { AppState } from '../../viewer/AppState';
import { MessageBus, CommandMessage, isMessage } from '../../api';
import { WebviewApi } from '../../api/WebviewApi';
import { sampleSettings } from '../samples/sampleSettings';
import dcopy from 'clone-deep';

export class AppStateFixture extends AppState {
    _webviewApi: WebviewApi;
    _postedMessages: CommandMessage[];

    constructor() {
        const webviewApi: WebviewApi = {
            postMessage: (msg: any) => {
                isMessage(msg) && this._postedMessages.push(msg);
                return webviewApi;
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
    appState.updateSettings(dcopy(sampleSettings));
    return appState;
}
