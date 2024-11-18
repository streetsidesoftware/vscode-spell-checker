#!/usr/bin/env node

import fs from 'node:fs/promises';

const pkgUrl = new URL('../package.json', import.meta.url);

function assertArgs() {
    if (process.argv.length !== 3 || !['true', 'false'].includes(process.argv[2])) {
        console.error('Usage: set-preview-mode.js <true|false>');
        throw new Error('Invalid arguments');
    }
}

async function run() {
    assertArgs();
    const isPreviewMode = process.argv[2] === 'true';

    const content = await fs.readFile(pkgUrl, 'utf-8');

    const updatedContent = content.replace(
        isPreviewMode ? '"pre-release": false' : '"pre-release": true',
        `"pre-release": ${isPreviewMode}`,
    );

    if (content === updatedContent) {
        console.log('Nothing to update');
        return;
    }

    await fs.writeFile(pkgUrl, updatedContent);

    console.log(`Preview mode is now ${isPreviewMode}`);
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
