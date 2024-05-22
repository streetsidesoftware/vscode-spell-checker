import { toUri as cvtToUri } from '@internal/common-utils/uriHelper';
import { Uri } from 'vscode';

export function toUri(uri: string | Uri): Uri;
export function toUri(uri: string | Uri | undefined | null): Uri | undefined;
export function toUri(uri: string | Uri | undefined | null): Uri | undefined {
    if (typeof uri === 'string') {
        return Uri.from(cvtToUri(uri));
    }
    return (uri && Uri.from(uri)) || undefined;
}
