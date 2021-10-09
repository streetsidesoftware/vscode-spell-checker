import { Uri } from 'vscode';

export function toUri(uri: string | Uri): Uri;
export function toUri(uri: string | Uri | undefined | null): Uri | undefined;
export function toUri(uri: string | Uri | undefined | null): Uri | undefined {
    if (typeof uri === 'string') {
        return Uri.parse(uri);
    }
    return (uri && Uri.from(uri)) || undefined;
}
