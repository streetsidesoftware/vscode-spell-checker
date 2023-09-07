import type { OpenLinkMessage } from '../api';
import type { VsCodeWebviewApi } from '../api/vscode/VsCodeWebviewApi';
import type { EXPLICIT_ANY } from '../types';

type ANY = EXPLICIT_ANY;

export function clickLink(vsCodeApi: VsCodeWebviewApi, event: React.MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault();
    const attrib = event.currentTarget.attributes;
    const href = attrib.getNamedItem('href')?.value;
    if (href) {
        openUri(vsCodeApi, href);
    }
}

export function openUri(vsCodeApi: VsCodeWebviewApi, uri: string): void {
    const msg: OpenLinkMessage = {
        command: 'OpenLinkMessage',
        value: { uri },
    };
    vsCodeApi.postMessage(msg);
}

export interface UriComponents {
    scheme: string;
    authority: string;
    path: string;
    query: string;
    fragment: string;
}

export function parseFileUri(uri: string): UriComponents {
    const m = uri.match(/(.*):\/\/(.*)/);
    if (m?.[1] !== 'file') {
        throw new Error(`Not a file scheme: ${uri}`);
    }
    const scheme = m[1];
    const path = decodeURIComponent(m[2]);
    return {
        scheme,
        path,
        authority: '',
        query: '',
        fragment: '',
    };
}

export function commandUri(command: string, params: ANY[]): string {
    return `command:${command}?${encodeURIComponent(JSON.stringify(params))}`;
}
