import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { downloadAndUnzipVSCode, runTests } from '@vscode/test-electron';
import decompress from 'decompress';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = path.resolve(__dirname, '../../../');

const cacheDirName = '.vscode-test';

async function run(version: undefined | 'stable' | 'insiders' | string, extensionDevelopmentPath: string) {
    // Delete `.vscode-test` to prevent socket issues
    await fs.rm(cacheDirName, { recursive: true, force: true });

    // The path to the extension test runner script
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './index.cjs');

    const fileToOpen = path.relative(process.cwd(), __filename);
    const launchArgs: string[] = ['--disable-extensions', fileToOpen];

    // try and have a short path to prevent socket errors.
    const cachePath = path.join(root, cacheDirName);
    const vscodeExecutablePath = await downloadAndUnzipVSCode({ cachePath, version });
    const options = { vscodeExecutablePath, extensionDevelopmentPath, extensionTestsPath, launchArgs };
    await runTests(options);
}

interface PackageJson {
    name: string;
    version: string;
    engines: { vscode: string };
}

let extPkg: PackageJson | undefined = undefined;

async function getPackageJson(): Promise<PackageJson> {
    if (extPkg) return extPkg;
    return (extPkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8')));
}

async function getVSCodeVersionFromPackage(): Promise<string> {
    const extPkg = await getPackageJson();
    return extPkg.engines['vscode'].replace('^', '');
}

async function getVsixName(location = ''): Promise<string> {
    const pkg = await getPackageJson();
    return path.join(location, `${pkg.name}-${pkg.version}.vsix`);
}

async function resolveExtension(vsixLocation: string | undefined): Promise<string> {
    if (!vsixLocation) return root;

    const vsixFile = vsixLocation.endsWith('.vsix') ? vsixLocation : await getVsixName(vsixLocation);

    const file = path.resolve(root, vsixFile);
    const extDir = file.replace(/\.vsix$/, '');

    await fs.rm(extDir, { recursive: true, force: true });
    console.warn('Decompressing: %s', file);
    await decompress(file, extDir);

    return path.join(extDir, 'extension');
}

async function main() {
    try {
        const ENV_VSCODE_VERSION = process.env['VSCODE_VERSION'];
        const versions = ENV_VSCODE_VERSION ? [ENV_VSCODE_VERSION] : ['stable', 'package.json'];
        const extensionDevelopmentPath = await resolveExtension(process.env['VSIX_LOCATION']);
        for (const version of versions) {
            const vscVersion = version === 'package.json' ? await getVSCodeVersionFromPackage() : version;
            console.log('Versions: %o', { version, vscVersion, extensionDevelopmentPath });
            await run(vscVersion, extensionDevelopmentPath);
        }
    } catch (err) {
        console.error(err);
        console.error('Failed to run tests');
        // eslint-disable-next-line no-process-exit
        process.exit(1);
    }
}

main();
