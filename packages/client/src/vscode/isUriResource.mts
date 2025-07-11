import { Uri } from 'vscode';

interface UriResource {
    readonly uri: Uri;
}
export function isUriResource<T extends UriResource>(r: T | unknown | undefined): r is T {
    return r instanceof Object && 'uri' in r && r.uri instanceof Uri;
}
