import { createHash } from 'node:crypto';

import { log } from '@internal/common-utils/log';
import type { VProviderFileSystem } from 'cspell-io';
import { FileType, FSCapabilityFlags, urlOrReferenceToUrl } from 'cspell-io';
import type { VFileSystemProvider } from 'cspell-lib';
import type { TextDocuments } from 'vscode-languageserver/node.js';
import type { TextDocument } from 'vscode-languageserver-textdocument';

export class CSpellFileSystemProvider implements VFileSystemProvider {
    readonly name = 'VSCode';
    constructor(private documents: TextDocuments<TextDocument>) {}

    getFileSystem(url: URL): VProviderFileSystem | undefined {
        if (url.protocol !== 'vscode-vfs:') return undefined;

        const vfs: VProviderFileSystem = {
            capabilities: FSCapabilityFlags.Read | FSCapabilityFlags.Stat,
            stat: async (urlRef) => {
                const url = urlOrReferenceToUrl(urlRef);
                log(`stat: ${url.href}`);
                const doc = this.documents.get(url.href);
                if (!doc) {
                    log(`File not found: ${url.href}`);
                    throw new VFSError('File not found', url);
                }
                const t = doc.getText();
                return {
                    isDirectory: () => false,
                    isFile: () => true,
                    isUnknown: () => false,
                    size: t.length,
                    mtimeMs: 0,
                    eTag: createHash('md5').update(t).digest('hex'),
                    fileType: FileType.File,
                };
            },
            readDirectory: async (_url) => [],
            readFile: async (urlRef) => {
                const url = urlOrReferenceToUrl(urlRef);
                log(`ReadFile: ${url.href}`);
                const doc = this.documents.get(url.href);
                if (!doc) {
                    throw new VFSError('File not found', url);
                }
                return {
                    url,
                    encoding: 'utf8',
                    content: doc.getText(),
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
