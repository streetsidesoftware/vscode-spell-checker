import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // reporters: 'verbose',
        coverage: {
            // enabled: true,
            provider: 'istanbul',
            clean: true,
            all: true,
            reportsDirectory: 'coverage',
            reporter: ['html', 'text', 'json'],
            exclude: [
                'ajv.config.*',
                'bin.mjs',
                'bin.js',
                'bin.cjs',
                '.coverage/**',
                'coverage',
                '_snapshots_',
                '.eslint*',
                'vitest*',
                '.prettier*',
                '**/*.test.*',
            ],
        },
    },
});
