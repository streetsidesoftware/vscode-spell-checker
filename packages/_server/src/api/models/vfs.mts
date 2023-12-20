import type { UriString } from '../apiModels.js';

/**
 * Enumeration of file types. The types `File` and `Directory` can also be
 * a symbolic links, in that case use `FileType.File | FileType.SymbolicLink` and
 * `FileType.Directory | FileType.SymbolicLink`.
 */
export enum FileType {
    /**
     * The file type is unknown.
     */
    Unknown = 0,
    /**
     * A regular file.
     */
    File = 1,
    /**
     * A directory.
     */
    Directory = 2,
    /**
     * A symbolic link to a file.
     */
    SymbolicLink = 64,
}

/**
 * The `FileStat`-type represents metadata about a file
 */
export interface FileStat {
    /**
     * The type of the file, e.g. is a regular file, a directory, or symbolic link
     * to a file.
     *
     * *Note:* This value might be a bitmask, e.g. `FileType.File | FileType.SymbolicLink`.
     */
    type: FileType;
    /**
     * The modification timestamp in milliseconds elapsed since January 1, 1970 00:00:00 UTC.
     *
     * *Note:* If the file changed, it is important to provide an updated `mtime` that advanced
     * from the previous value. Otherwise there may be optimizations in place that will not show
     * the updated file contents in an editor for example.
     */
    mtime: number;
    /**
     * The size in bytes.
     *
     * *Note:* If the file changed, it is important to provide an updated `size`. Otherwise there
     * may be optimizations in place that will not show the updated file contents in an editor for
     * example.
     */
    size: number;
}

export interface FileContent {
    uri: UriString;
    /**
     * The encoding of the content if known.
     * Defaults to 'utf8' if not provided.
     */
    encoding?: string;
    content: string;
}

export interface VfsFileSystem {
    /**
     * Retrieve metadata about a file.
     *
     * @param uri The uri of the file to retrieve metadata about.
     * @return The file metadata about the file.
     */
    stat(uri: UriString): Promise<FileStat>;

    /**
     * Retrieve all entries of a {@link FileType.Directory directory}.
     *
     * @param uri The uri of the folder.
     * @return An array of name/type-tuples or a promise that resolves to such.
     */
    readDirectory(uri: UriString): Promise<[string, FileType][]>;

    /**
     * Read the entire contents of a file.
     *
     * @param uri The uri of the file.
     * @return An array of bytes or a promise that resolves to such.
     */
    readFile(uri: UriString): Promise<FileContent>;
}
