import { AppState } from '../../viewer/AppState';
import { MessageBus } from '../../api';
import { WebviewApi } from '../../api/WebviewApi';
import { sampleSettings } from '../samples/sampleSettings';

export function sampleAppState(): AppState {
    const webviewApi: WebviewApi = {
        postMessage: (msg: any) => webviewApi,
        onmessage: undefined,
    };
    const msgBus = new MessageBus(webviewApi);
    const appState = new AppState(msgBus);
    appState.settings = sampleSettings;
    return appState;
}
