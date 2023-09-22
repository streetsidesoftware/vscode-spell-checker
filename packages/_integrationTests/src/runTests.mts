import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { downloadAndUnzipVSCode, runTests } from '@vscode/test-electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const extensionDevelopmentPath = path.resolve(__dirname, '../../../');

const cacheDirName = '.vscode-test';

async function run(version: undefined | 'stable' | 'insiders' | string) {
    // Delete `.vscode-test` to prevent socket issues
    await fs.rm(cacheDirName, { recursive: true, force: true });

    // The path to the extension test runner script
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './index.cjs');

    const fileToOpen = path.relative(process.cwd(), __filename);
    const launchArgs: string[] = ['--disable-extensions', fileToOpen];

    // try and have a short path to prevent socket errors.
    const cachePath = path.join(extensionDevelopmentPath, cacheDirName);
    const vscodeExecutablePath = await downloadAndUnzipVSCode({ cachePath, version });
    const options = { vscodeExecutablePath, extensionDevelopmentPath, extensionTestsPath, launchArgs };
    await runTests(options);
}

async function getVSCodeVersionFromPackage(): Promise<string> {
    const extPkg = JSON.parse(await fs.readFile(path.join(extensionDevelopmentPath, 'package.json'), 'utf8'));
    return extPkg.engines['vscode'].replace('^', '');
}

async function main() {
    try {
        const versions = process.env['VSCODE_VERSION'] ? [process.env['VSCODE_VERSION']] : ['stable', 'package.json'];
        for (const version of versions) {
            const vscVersion = version === 'package.json' ? await getVSCodeVersionFromPackage() : version;
            console.log('Versions: %o', { version, vscVersion });
            await run(vscVersion);
        }
    } catch (err) {
        console.error(err);
        console.error('Failed to run tests');
        // eslint-disable-next-line no-process-exit
        process.exit(1);
    }
}

main();
