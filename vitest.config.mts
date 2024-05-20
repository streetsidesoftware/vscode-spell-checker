import { defineConfig } from 'vitest/config';

export default defineConfig({
    esbuild: { target: 'es2022' },
    test: {
        // cspell:ignore tsup
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/cypress/**',
            '**/coverage/**',
            '**/temp/**',
            '**/.{idea,git,cache,output,temp}/**',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        ],
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
