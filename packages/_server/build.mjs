#!/usr/bin/env node
/* eslint-disable node/no-extraneous-import */
import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).argv;

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const minify = argv['minify'] ?? argv['production'] ?? false;

async function buildAll() {
    // Note: cjs is the only possible option at this moment.
    await esbuild.build({
        absWorkingDir: __dirname,
        entryPoints: ['src/main.ts'],
        bundle: true,
        minify,
        platform: 'node',
        outfile: 'dist/main.cjs',
        sourcemap: true,
    });
}

buildAll();
