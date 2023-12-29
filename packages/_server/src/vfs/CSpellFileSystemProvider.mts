import { logDebug } from '@internal/common-utils/log';
import type { VProviderFileSystem } from 'cspell-io';
import { FSCapabilityFlags, urlOrReferenceToUrl, VFileType } from 'cspell-io';
import type { VFileSystemProvider } from 'cspell-lib';
import { getVirtualFS } from 'cspell-lib';
import { DisposableList } from 'utils-disposables';
import type { Connection, Disposable, TextDocuments, WorkspaceFolder } from 'vscode-languageserver/node.js';
import type { TextDocument } from 'vscode-languageserver-textdocument';

import type { ServerSideApi } from '../api.js';
import { FileType } from '../api.js';
import { findMatchingFolderForUri } from '../utils/matchingFoldersForUri.mjs';

const debugFileProtocol = false;

const NotHandledProtocols: Record<string, boolean> = {
    'http:': true,
    'https:': true,
    'file:': !debugFileProtocol, // Use the cspell-io file system provider for performance.
};

class CSpellFileSystemProvider implements VFileSystemProvider {
    readonly name = 'VSCode';
    private pFolders: Promise<WorkspaceFolder[]> | undefined;
    private folders: WorkspaceFolder[] | undefined;
    private disposables = new DisposableList();
    constructor(
        private connection: Connection,
        private api: ServerSideApi,
        private documents: TextDocuments<TextDocument>,
    ) {
        this.init();
    }

    private async updateWorkspaceFolders() {
        this.pFolders = this._updateWorkspaceFolders();
        return this.pFolders;
    }

    private async _updateWorkspaceFolders() {
        try {
            const folders = await this.connection.workspace.getWorkspaceFolders();
            logDebug(`Workspace folders: ${JSON.stringify(folders)}`);
            this.folders = folders ?? [];
            this.pFolders = undefined;
            return this.folders;
        } catch (e) {
            logDebug(`Error getting workspace folders: ${e}`);
            return [];
        }
    }

    getFileSystem(url: URL): VProviderFileSystem | undefined {
        if (NotHandledProtocols[url.protocol.toLowerCase()]) return undefined;

        const vfs: VProviderFileSystem = {
            capabilities: FSCapabilityFlags.Read | FSCapabilityFlags.Stat | FSCapabilityFlags.ReadDir,
            stat: async (urlRef) => {
                const url = urlOrReferenceToUrl(urlRef);
                logDebug(`stat req: ${url.href}`);
                const stat = await this.api.clientRequest.vfsStat(url.href);

                return {
                    size: stat.size,
                    mtimeMs: stat.mtime,
                    fileType:
                        stat.type & FileType.File
                            ? VFileType.File
                            : stat.type & FileType.Directory
                              ? VFileType.Directory
                              : VFileType.Unknown,
                };
            },
            readDirectory: async (urlRef) => {
                const url = urlOrReferenceToUrl(urlRef);
                logDebug(`readDirectory: ${url.href}`);
                const href = url.href;
                const folders = (await this.pFolders) ?? this.folders ?? (await this.updateWorkspaceFolders());
                const folder = findMatchingFolderForUri(folders, href);
                // Do not read directories outside of the workspace.
                if (!folder) {
                    logDebug(`readDirectory: ${url.href} not in workspace: ${JSON.stringify(folders)}`);
                    logDebug(`readDirectory: ${url.href} not in workspace`);
                    return [];
                }
                const entries = await this.api.clientRequest.vfsReadDirectory(href);
                return entries
                    .map(([name, type]) => [name, type & FileType.Directory ? VFileType.Directory : VFileType.File] as const)
                    .map(([name, type]) => ({ name, dir: url, fileType: type }));
            },
            readFile: async (urlRef) => {
                const url = urlOrReferenceToUrl(urlRef);
                logDebug(`ReadFile: ${url.href}`);
                const doc = this.documents.get(url.href);
                if (doc) {
                    return {
                        url,
                        encoding: 'utf8',
                        content: doc.getText(),
                    };
                }
                const result = await this.api.clientRequest.vfsReadFile(url.href);
                return {
                    url: new URL(result.uri),
                    content: Buffer.from(result.content, result.encoding),
                };
            },
            writeFile: async (urlRef) => {
                throw new VFSError('Not implemented', urlOrReferenceToUrl(urlRef));
            },
            providerInfo: {
                name: this.name,
            },
            dispose: () => {
                this.disposables.dispose();
            },
        };

        return vfs;
    }

    private init() {
        this.disposables.push(
            this.connection.onInitialized(() => {
                this.disposables.push(
                    this.connection.workspace.onDidChangeWorkspaceFolders(() => {
                        this.updateWorkspaceFolders();
                    }),
                );
            }),
        );
    }
}

export function bindFileSystemProvider(connection: Connection, api: ServerSideApi, documents: TextDocuments<TextDocument>): Disposable {
    const provider = new CSpellFileSystemProvider(connection, api, documents);
    const vfs = getVirtualFS();
    if (debugFileProtocol) {
        vfs.enableLogging(true);
    }
    return vfs.registerFileSystemProvider(provider);
}

export class VFSError extends Error {
    constructor(
        message: string,
        public readonly url: URL,
    ) {
        super(message);
    }
}
