import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        // This is the non-bundled version used for the API to the client.
        entry: ['src/extension.mts', 'src/extensionApi.mts'],
        outDir: 'dist',
        format: ['cjs'],
        dts: true,
        external: ['vscode'],
        noExternal: [/.*/],
        sourcemap: true,
        clean: true,
    },
]);
