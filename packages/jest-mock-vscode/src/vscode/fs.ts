import type * as vscode from 'vscode';

export type FileSystem = vscode.FileSystem;
export type FileSystemProvider = vscode.FileSystemProvider;

export function createMockFileSystem(provider: FileSystemProvider = createMockFileSystemProvider()): FileSystem {
    const fs: FileSystem = {
        stat: jest.fn((...p) => Promise.resolve(provider.stat(...p))),
        readDirectory: jest.fn((...p) => Promise.resolve(provider.readDirectory(...p))),
        readFile: jest.fn((...p) => Promise.resolve(provider.readFile(...p))),
        rename: jest.fn((oldUri, newUri, opt) =>
            Promise.resolve(provider.rename(oldUri, newUri, { ...opt, overwrite: opt?.overwrite ?? false }))
        ),
        createDirectory: jest.fn((...p) => Promise.resolve(provider.createDirectory(...p))),
        copy: jest.fn((src, target, opt) => Promise.resolve(provider.copy?.(src, target, { ...opt, overwrite: opt?.overwrite ?? true }))),
        writeFile: jest.fn((...p) => Promise.resolve(provider.writeFile(...p, { create: true, overwrite: true }))),
        delete: jest.fn((uri, opt) => Promise.resolve(provider.delete(uri, { recursive: opt?.recursive ?? true }))),
        isWritableFileSystem: jest.fn(),
    };

    return fs;
}

export function createMockFileSystemProvider(): FileSystemProvider {
    const fsp: FileSystemProvider = {
        copy: jest.fn(),
        createDirectory: jest.fn(),
        delete: jest.fn(),
        onDidChangeFile: jest.fn(),
        readDirectory: jest.fn(),
        readFile: jest.fn(),
        rename: jest.fn(),
        stat: jest.fn(),
        watch: jest.fn(),
        writeFile: jest.fn(),
    };
    return fsp;
}
