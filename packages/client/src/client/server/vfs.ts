import type { FileContent, FileStat, UriString } from 'code-spell-checker-server/api';
import type { FileType } from 'vscode';
import { Uri, workspace } from 'vscode';

/**
 * Retrieve metadata about a file.
 *
 * @param uri The uri of the file to retrieve metadata about.
 * @return The file metadata about the file.
 */
export async function vfsStat(href: UriString): Promise<FileStat> {
    const uri = Uri.parse(href);
    const stat = await workspace.fs.stat(uri);
    return stat;
}

/**
 * Retrieve all entries of a {@link FileType.Directory directory}.
 *
 * @param uri The uri of the folder.
 * @return An array of name/type-tuples or a promise that resolves to such.
 */
export async function vfsReadDirectory(href: UriString): Promise<[string, FileType][]> {
    const uri = Uri.parse(href);
    const r = await workspace.fs.readDirectory(uri);
    return r;
}

/**
 * Read the entire contents of a file.
 *
 * @param uri The uri of the file.
 * @return An array of bytes or a promise that resolves to such.
 */
export async function vfsReadFile(href: UriString): Promise<FileContent> {
    const uri = Uri.parse(href);
    const content = await workspace.fs.readFile(uri);
    return {
        uri: href,
        encoding: 'base64',
        content: Buffer.from(content).toString('base64'),
    };
}
