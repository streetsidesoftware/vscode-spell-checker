import { OpenFileMessage } from '.';
import { VsCodeWebviewApi } from './vscode/VsCodeWebviewApi';

export function clickLink(vsCodeApi: VsCodeWebviewApi, event: React.MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault();
    const attrib = event.currentTarget.attributes;
    const href = attrib.getNamedItem('href')?.value;
    if (href) {
        openUri(vsCodeApi, href);
    }
}

export function openUri(vsCodeApi: VsCodeWebviewApi, uri: string): void {
    const msg: OpenFileMessage = {
        command: 'OpenFileMessage',
        value: { uri },
    };
    vsCodeApi.postMessage(msg);
}
