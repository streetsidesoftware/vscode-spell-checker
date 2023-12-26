import type { ExcludeDisposableHybrid } from 'utils-disposables';
import { injectDisposable } from 'utils-disposables';
import { vi } from 'vitest';

import type { IsSpellCheckEnabledResult, ServerSideApi, ServerSideHandlers } from '../api.js';

export function createMockServerSideApi() {
    const api = {
        serverNotification: {
            notifyConfigChange: { subscribe: vi.fn() },
            registerConfigurationFile: { subscribe: vi.fn() },
        },
        serverRequest: {
            getConfigurationForDocument: { subscribe: vi.fn() },
            isSpellCheckEnabled: { subscribe: vi.fn() },
            splitTextIntoWords: { subscribe: vi.fn() },
            getSpellCheckingOffsets: { subscribe: vi.fn() },
            spellingSuggestions: { subscribe: vi.fn() },
        },
        clientNotification: {
            onSpellCheckDocument: vi.fn(),
            onDiagnostics: vi.fn(),
        },
        clientRequest: {
            onWorkspaceConfigForDocumentRequest: vi.fn(),
            vfsReadDirectory: vi.fn(() => Promise.resolve([])),
            vfsReadFile: vi.fn(() => Promise.resolve({ uri: '', content: '' })),
            vfsStat: vi.fn(() => Promise.resolve({ type: 0, size: 0, mtime: 0 })),
        },
    } satisfies ExcludeDisposableHybrid<ServerSideApi>;

    return vi.mocked(injectDisposable<ExcludeDisposableHybrid<ServerSideApi>>(api, () => undefined));
}

export function mockHandlers(): ServerSideHandlers {
    const sampleIsSpellCheckEnabledResult: IsSpellCheckEnabledResult = {
        uriUsed: undefined,
        workspaceFolderUri: undefined,
        languageEnabled: undefined,
        languageId: undefined,
        fileEnabled: true,
        fileIsIncluded: true,
        fileIsExcluded: false,
        excludedBy: undefined,
        gitignored: undefined,
        gitignoreInfo: undefined,
        blockedReason: undefined,
    };

    return {
        serverNotifications: {
            notifyConfigChange: vi.fn(),
            registerConfigurationFile: vi.fn(),
        },
        serverRequests: {
            getConfigurationForDocument: vi.fn(() => ({
                ...sampleIsSpellCheckEnabledResult,
                settings: undefined,
                docSettings: undefined,
                configFiles: [],
                configTargets: [],
            })),
            isSpellCheckEnabled: vi.fn(() => ({ ...sampleIsSpellCheckEnabledResult })),
            splitTextIntoWords: vi.fn(() => ({ words: [] })),
            spellingSuggestions: vi.fn(() => ({ suggestions: [] })),
            getSpellCheckingOffsets: vi.fn(() => ({ offsets: [] })),
        },
    };
}
