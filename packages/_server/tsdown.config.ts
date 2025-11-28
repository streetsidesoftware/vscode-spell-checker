import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        // This is the bundled version used for the server.
        entry: ['src/main.mts'],
        outDir: 'dist',
        format: ['esm', 'cjs'],
        // dts: true,
        sourcemap: true,
        // splitting: false,
        noExternal: [/.*/],
        clean: true,
        target: 'node22',
        fixedExtension: false,
    },
    {
        // This is the non-bundled version used for the API to the client.
        entry: ['src/main.mts', 'src/api.ts', 'src/lib/index.mts'],
        outDir: 'out',
        format: ['esm', 'cjs'],
        dts: true,
        sourcemap: true,
        clean: true,
        target: 'node22',
        fixedExtension: false,
    },
]);
