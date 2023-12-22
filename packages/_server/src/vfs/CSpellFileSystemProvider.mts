import { logDebug } from '@internal/common-utils/log';
import type { VProviderFileSystem } from 'cspell-io';
import { FSCapabilityFlags, urlOrReferenceToUrl, VFileType } from 'cspell-io';
import type { VFileSystemProvider } from 'cspell-lib';
import type { TextDocuments } from 'vscode-languageserver/node.js';
import type { TextDocument } from 'vscode-languageserver-textdocument';

import type { ServerSideApi } from '../api.js';
import { FileType } from '../api.js';

const UseCSpellForProtocol: Record<string, boolean> = {
    'http:': true,
    'https:': true,
    'file:': true, // Use the cspell-io file system provider for performance.
};

export class CSpellFileSystemProvider implements VFileSystemProvider {
    readonly name = 'VSCode';
    constructor(
        private api: ServerSideApi,
        private documents: TextDocuments<TextDocument>,
    ) {}

    getFileSystem(url: URL): VProviderFileSystem | undefined {
        if (UseCSpellForProtocol[url.protocol.toLowerCase()]) return undefined;

        const vfs: VProviderFileSystem = {
            capabilities: FSCapabilityFlags.Read | FSCapabilityFlags.Stat | FSCapabilityFlags.ReadDir,
            stat: async (urlRef) => {
                const url = urlOrReferenceToUrl(urlRef);
                logDebug(`stat req: ${url.href}`);
                const stat = await this.api.clientRequest.vfsStat(url.href);
                logDebug(`stat res: ${url.href}\n                                    \t${JSON.stringify(stat)}`);

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
            readDirectory: async (_url) => {
                const url = urlOrReferenceToUrl(_url);
                logDebug(`readDirectory: ${url.href}`);
                const entries = await this.api.clientRequest.vfsReadDirectory(url.href);
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
            dispose: () => {},
        };

        return vfs;
    }
}

export class VFSError extends Error {
    constructor(
        message: string,
        public readonly url: URL,
    ) {
        super(message);
    }
}
