import { AppState } from '../../viewer/AppState';
import { MessageBus } from '../../api';
import { WebviewApi } from '../../api/WebviewApi';
import { sampleSettings } from '../samples/sampleSettings';
// import dcopy from 'deep-copy'; // Does not work because there isn't really a default.
const dcopy: <T>(v: T)=>T = require('deep-copy');

export function sampleAppState(): AppState {
    const webviewApi: WebviewApi = {
        postMessage: (msg: any) => webviewApi,
        onmessage: undefined,
    };
    const msgBus = new MessageBus(webviewApi);
    const appState = new AppState(msgBus);
    appState.settings = dcopy(sampleSettings);
    return appState;
}
