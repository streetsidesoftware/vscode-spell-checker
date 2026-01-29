import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        entry: ['src/extension.mts', 'src/extensionApi.mts'],
        outDir: 'dist',
        format: ['cjs'],
        dts: false,
        sourcemap: true,
        // splitting: false,
        external: ['vscode'],
        target: 'node22',
        fixedExtension: true,
        inlineOnly: false,

        clean: true,
    },
    {
        // This is used by the integration tests to get type information.
        entry: ['src/extensionApi.mts', 'src/client/index.mts'],
        outDir: 'out',
        format: ['esm'],
        dts: {
            emitDtsOnly: true,
        },
        sourcemap: true,
        // splitting: false,
        external: ['vscode'],
        target: 'node22',
        fixedExtension: true,
        inlineOnly: false,

        clean: true,
    },
]);
