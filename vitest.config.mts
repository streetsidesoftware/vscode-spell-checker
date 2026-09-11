// eslint-disable-next-line n/no-extraneous-import
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        projects: ['packages/!(_integrationTests)'],
    },
});
