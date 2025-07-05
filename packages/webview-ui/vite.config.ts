import fs from 'node:fs/promises';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { Manifest } from 'vite';
import { defineConfig } from 'vite';

const urlDist = new URL('./dist/', import.meta.url);
const urlManifest = new URL('manifest.json', urlDist);
const urlIndexJs = new URL('index.js', urlDist);

// https://vite.dev/config/
export default defineConfig({
    build: {
        manifest: 'manifest.json',
        ssrManifest: false,
        // rollupOptions: {
        //     // overwrite default .html entry
        //     input: 'src/main.ts',
        // },
    },
    plugins: [svelte(), buildIndex()],
});

function buildIndex() {
    return {
        name: 'build index.js',
        apply: 'build', // this executes after build. I hope this helps
        async writeBundle() {
            const manifest: Manifest = JSON.parse(await fs.readFile(urlManifest, 'utf-8'));
            await fs.writeFile(urlIndexJs, templateJs(manifest['index.html']), 'utf-8');
        },
    } as const;
}

function templateJs(indexManifest: Manifest[string]): string {
    return `
export const main = ${JSON.stringify('dist/' + indexManifest.file)};
export const css = ${JSON.stringify(indexManifest.css?.map((file) => `dist/${file}`) || [])};
`;
}
