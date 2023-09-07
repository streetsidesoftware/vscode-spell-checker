#!/usr/bin/env node

import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).argv;

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const minify = argv['minify'] ?? argv['production'] ?? false;
const watchMode = argv['watch'] || false;

/**
 *
 * @param {import('esbuild').BuildOptions} options
 */
function build(options) {
    return esbuild.build(options);
}

/**
 *
 * @param {import('esbuild').BuildOptions} options
 */
async function watch(options) {
    const ctx = await esbuild.context(options);
    return ctx.watch();
}

/**
 * @type {import('esbuild').BuildOptions}
 */
const optionsBase = {
    absWorkingDir: __dirname,
    bundle: true,
    minify,
    platform: 'node',
    sourcemap: true,
    external: ['vscode'],
};

async function buildAll() {
    // Note: cjs is the only possible option at this moment.

    /** @type {import('esbuild').BuildOptions[]} */
    const configs = [
        {
            ...optionsBase,
            entryPoints: ['src/extension.ts'],
            outfile: 'dist/extension.js',
        },
        {
            ...optionsBase,
            entryPoints: ['src/extensionApi.ts'],
            outfile: 'dist/extensionApi.js',
        },
    ];

    const builds = configs.map(watchMode ? watch : build);
    await Promise.all(builds);
}

buildAll();
