import type { ExcludeDisposableHybrid } from 'utils-disposables';
import { injectDisposable } from 'utils-disposables';
import { vi } from 'vitest';

import type { ServerSideApi } from '../api.js';

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
            spellingSuggestions: { subscribe: vi.fn() },
        },
        clientNotification: {
            onSpellCheckDocument: vi.fn(),
        },
        clientRequest: {
            onWorkspaceConfigForDocumentRequest: vi.fn(),
        },
    } satisfies ExcludeDisposableHybrid<ServerSideApi>;

    return vi.mocked(injectDisposable<ExcludeDisposableHybrid<ServerSideApi>>(api, () => undefined));
}
