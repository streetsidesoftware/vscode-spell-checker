import Link from '@material-ui/core/Link';
import * as React from 'react';
import { commandUri } from '../../helpers/link';

export function LinkOpenFile({ uri, text, line }: { uri: string; text: string | JSX.Element; line?: number }): JSX.Element {
    const args = [uri, line].filter((a) => !!a);
    return LinkCommand({ command: 'cSpell.openFileAtLine', args, text });
}

export function LinkCommand({ command, args, text }: { command: string; args: any[]; text: string | JSX.Element }): JSX.Element {
    const href = commandUri(command, args);
    return <Link href={href}>{text}</Link>;
}
