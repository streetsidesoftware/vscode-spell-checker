import { Command } from 'commander';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as Path from 'node:path';
import type { Dependencies, PackageJson } from './packageDef';
import { findUp } from 'find-up';
import YarnLockFile, { FirstLevelDependency, LockFileObject } from '@yarnpkg/lockfile';
import semverSatisfies from 'semver/functions/satisfies.js';
import chalk from 'chalk';
import { promisify } from 'node:util';
import _glob from 'glob';

const glob = promisify(_glob);

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);
const __packageName = Path.join(__dirname, '../package.json');

async function run(cmd?: Command): Promise<void> {
    const program = cmd || new Command();

    const { version = '0.0.0' } = await readPackage(__packageName);

    program.version(version).description('Dependency Updater for package.json').option('-u, --update', 'Update Dependencies');

    await program.parseAsync();

    console.log('Checking Dependencies');
    console.log();

    const yarnLockFile = await findYarnLockFile();
    if (!yarnLockFile) {
        console.error('`yarn.lock` file not found.');
        process.exitCode = 1;
        return;
    }
    const yarnLock = await loadYarnLock(yarnLockFile);
    const root = Path.dirname(yarnLockFile);
    const packageFilename = Path.join(root, 'package.json');
    const packageJson = await readPackage(packageFilename);

    const workspaces = extractWorkspaceGlobs(packageJson);
    const workspacePackageFiles = await getWorkspacesPackages(root, workspaces);

    // console.log('Workspace Files: %o', workspacePackageFiles);

    const lock: LockFileObject = yarnLock.object;
    const update = !!program.opts().update;

    await processPackage(packageFilename, packageJson, lock, update);

    await Promise.all(workspacePackageFiles.map((p) => Path.join(root, p)).map((f) => processPackageFile(f, lock, update)));
}

export const app = {
    run,
};

async function processPackageFile(packageFilename: string, lock: LockFileObject, update: boolean): Promise<boolean> {
    const packageJson = await readPackage(packageFilename);
    return processPackage(packageFilename, packageJson, lock, update);
}

async function processPackage(packageFilename: string, packageJson: PackageJson, lock: LockFileObject, update: boolean): Promise<boolean> {
    const { dependencies = {}, devDependencies = {} } = packageJson;

    const resolvedDep = getDependencies(dependencies, lock);
    const resolvedDevDep = getDependencies(devDependencies, lock);

    console.log();
    console.log(chalk.yellow(packageFilename));
    console.log(!resolvedDep.length ? chalk.green('Dependencies are up to date.') : chalk.red('Dependencies'));
    resolvedDep.forEach(showUpdate);
    console.log(!resolvedDevDep.length ? chalk.green('DevDependencies are up to date.') : chalk.red('DevDependencies'));
    resolvedDevDep.forEach(showUpdate);

    if (!resolvedDep.length && !resolvedDevDep.length) return true;

    if (!update) {
        if (resolvedDep.length || resolvedDevDep.length) {
            process.exitCode = 1;
        }
        return false;
    }

    resolvedDep.forEach((d) => (dependencies[d.moduleName] = d.newRange));
    resolvedDevDep.forEach((d) => (devDependencies[d.moduleName] = d.newRange));

    const content = JSON.stringify(packageJson, null, 2) + '\n';

    await writeFile(packageFilename, content);

    return true;
}

async function readPackage(filename: string): Promise<PackageJson> {
    return JSON.parse(await readFile(filename, 'utf8')) as PackageJson;
}

function findYarnLockFile() {
    return findUp('yarn.lock');
}

async function loadYarnLock(yarnLockFile: string) {
    const lockFileContent = await readFile(yarnLockFile, 'utf8');

    return YarnLockFile.parse(lockFileContent, yarnLockFile);
}

function getDependencies(dep: Dependencies, lock: LockFileObject) {
    return Object.entries(dep)
        .map(([moduleName, range]) => processDependency(moduleName, range, lock[moduleName + '@' + range]))
        .filter(isDependencyUpdateFound);
}

function processDependency(moduleName: string, range: string, dep: FirstLevelDependency | undefined): DependencyUpdate {
    const foundVersion = dep?.version;

    return {
        moduleName,
        range,
        foundVersion,
        newRange: determineNewRange(range, foundVersion),
    };
}

function determineNewRange(range: string, version: string | undefined): string | undefined {
    if (!version || !semverSatisfies(version, range) || !isValidRange(range) || !isValidVersion(version)) return undefined;
    return '^' + version;
}

const regIsValidRange = /^\^\d+\.\d+\.\d+$/;
const regIsValidVersion = /^\d+\.\d+\.\d+$/;

function isValidRange(range: string): boolean {
    return regIsValidRange.test(range);
}

function isValidVersion(version: string): boolean {
    return regIsValidVersion.test(version);
}

interface DependencyUpdateFound {
    moduleName: string;
    range: string;
    foundVersion: string;
    newRange: string;
}

interface DependencyUpdateResult {
    moduleName: string;
    range: string;
    foundVersion: string | undefined;
    newRange: string | undefined;
}

type DependencyUpdate = DependencyUpdateFound | DependencyUpdateResult;

function isDependencyUpdateFound(d: DependencyUpdate): d is DependencyUpdateFound {
    return !!(d.foundVersion && d.newRange) && d.range !== d.newRange;
}

function showUpdate(dep: DependencyUpdateFound) {
    console.log(chalk`    ${dep.moduleName} {green ${dep.range}} {yellow =>} {green ${dep.newRange}}`);
}

/**
 * Find any workspace package.json files.
 * @param rootDir - root directory of the project.
 * @param globs - workspace globs to search for `package.json`
 */
async function getWorkspacesPackages(rootDir: string, globs: string[]): Promise<string[]> {
    const searchGlobs = globs.map((g) => g.replace(/\/$/g, '')).map((g) => g + '/package.json');

    const options = {
        cwd: rootDir,
        root: rootDir,
    };

    const all = await Promise.all(searchGlobs.map((g) => glob(g, options)));

    return [...flatten(all)];
}

function* flatten<T>(iter: Iterable<Iterable<T>> | T[][]): Iterable<T> {
    for (const i of iter) {
        yield* i;
    }
}

function extractWorkspaceGlobs(packageJson: PackageJson): string[] {
    const workspaces = packageJson.workspaces;
    if (!workspaces) return [];

    if (Array.isArray(workspaces)) return workspaces;

    return workspaces.packages;
}
