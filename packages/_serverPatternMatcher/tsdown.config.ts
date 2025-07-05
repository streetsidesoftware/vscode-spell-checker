import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        // This is the non-bundled version used for the API to the client.
        entry: ['src/main.mts', 'src/api.ts'],
        outDir: 'dist',
        format: ['esm', 'cjs'],
        dts: true,
        noExternal: [/.*/],
        sourcemap: true,
        clean: true,
    },
]);
