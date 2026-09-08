import { describe, expect, test } from 'vitest';

import { views, viewsContainers } from './views.ts';

describe('views', () => {
    test('All views in the containers should exist', () => {
        const setOfViews = new Set(Object.keys(views));

        for (const container of Object.values(viewsContainers)) {
            for (const item of container) {
                expect(setOfViews.has(item.id), `Expected view with id '${item.id}' to exist in views`).toBe(true);
            }
        }
    });
});
