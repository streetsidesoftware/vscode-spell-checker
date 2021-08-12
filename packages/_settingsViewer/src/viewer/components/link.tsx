import * as React from 'react';
import Link from '@material-ui/core/Link';
import { parseFileUri, commandUri } from '../../helpers/link';

export function LinkOpenFile({ uri, text }: { uri: string; text: string | JSX.Element }): JSX.Element {
    return LinkCommand({ command: 'vscode.open', args: [parseFileUri(uri)], text });
}

export function LinkCommand({ command, args, text }: { command: string; args: any[]; text: string | JSX.Element }): JSX.Element {
    const href = commandUri(command, args);
    return <Link href={href}>{text}</Link>;
}
