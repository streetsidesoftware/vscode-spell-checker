#!/usr/bin/env node

// @ts-check
import fs from 'node:fs/promises';

/**
 * @template T
 * @typedef {{ -readonly [K in keyof T]: T[K] }} Mutable<T>
 */

/**
 * @typedef {Mutable<import('@vscode/vsce').IPackageOptions>} VSCEPackageOptions
 */

const pkgUrl = new URL('../package.json', import.meta.url);

function assertArgs() {
    if (process.argv.length !== 3 || !['true', 'false'].includes(process.argv[2])) {
        console.error('Usage: set-prerelease-mode.js <true|false>');
        throw new Error('Invalid arguments');
    }
}

async function run() {
    assertArgs();
    const isPrereleaseMode = process.argv[2] === 'true' || undefined;

    const content = JSON.parse(await fs.readFile(pkgUrl, 'utf-8'));
    const vsce = /** @type {VSCEPackageOptions} */ (content['vsce'] || {});
    content['vsce'] = vsce;

    if (!!vsce.preRelease === isPrereleaseMode) {
        console.log(`Prerelease mode is already ${isPrereleaseMode}`);
        return;
    }

    if (isPrereleaseMode) {
        vsce.preRelease = true;
    } else {
        vsce.preRelease = undefined;
    }

    await fs.writeFile(pkgUrl, JSON.stringify(content, null, 2) + '\n');

    console.log(`Prerelease mode is now ${isPrereleaseMode || false}`);
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
