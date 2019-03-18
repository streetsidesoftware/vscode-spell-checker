import { AppState } from '../../viewer/AppState';
import { MessageBus } from '../../api';
import { WebviewApi } from '../../api/WebviewApi';

export function sampleAppState(): AppState {
    const webviewApi: WebviewApi = {
        postMessage: (msg: any) => webviewApi,
        onmessage: undefined,
    };
    const msgBus = new MessageBus(webviewApi);
    return new AppState(msgBus);
}
