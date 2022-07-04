import { Uri } from 'vscode';
import { toUri as cvtToUri } from 'common-utils/uriHelper';

export function toUri(uri: string | Uri): Uri;
export function toUri(uri: string | Uri | undefined | null): Uri | undefined;
export function toUri(uri: string | Uri | undefined | null): Uri | undefined {
    if (typeof uri === 'string') {
        return Uri.from(cvtToUri(uri));
    }
    return (uri && Uri.from(uri)) || undefined;
}
