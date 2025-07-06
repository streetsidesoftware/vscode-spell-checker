import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        // This is the bundled version used by the extension.
        entry: ['src/extension.mts'],
        outDir: 'dist',
        format: ['cjs'],
        dts: true,
        external: ['vscode'],
        sourcemap: true,
        clean: true,
    },
    {
        // This is the non-bundled version used for the API to the client.
        entry: ['src/extensionApi.mts', 'src/client/index.mts'],
        outDir: 'out',
        format: ['esm'],
        dts: true,
        external: ['vscode'],
        noExternal: [/.*/],
        sourcemap: true,
        clean: true,
    },
]);
