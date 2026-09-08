import * as fs from 'node:fs/promises';
import * as Path from 'node:path';

import { contributes as clientContributions, type IExtensionContributions } from 'client/contributionPoints';
import { Command } from 'commander';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import { normalizeDescriptions } from './normalizeDescriptions.ts';

export function commandUpdatePackageCSpellSchema(): Command {
    const command = new Command('update-package-schema');

    command
        .argument('[package]', 'Path to package.json', './package.json')
        .argument('[schema-file]', 'Path to .schema.json file.', './packages/_server/spell-checker-config.schema.json')
        .option('-r, --root <path>', 'Directory to use as the current directory.')
        .action(action);

    return command;
}

type KeyPairs<T> = {
    [K in keyof T]: K;
};

type ContribKeyMap = KeyPairs<Required<Omit<IExtensionContributions, 'configuration'>>>;

const contribKeys: ContribKeyMap = {
    authentication: 'authentication',
    colors: 'colors',
    commands: 'commands',
    configurationDefaults: 'configurationDefaults',
    debuggers: 'debuggers',
    grammars: 'grammars',
    icons: 'icons',
    iconThemes: 'iconThemes',
    jsonValidation: 'jsonValidation',
    jsonValidationRegistry: 'jsonValidationRegistry',
    keybindings: 'keybindings',
    languages: 'languages',
    localizations: 'localizations',
    menus: 'menus',
    productIconThemes: 'productIconThemes',
    snippets: 'snippets',
    startEntries: 'startEntries',
    submenus: 'submenus',
    terminal: 'terminal',
    themes: 'themes',
    views: 'views',
    viewsContainers: 'viewsContainers',
    viewsWelcome: 'viewsWelcome',
    walkthroughs: 'walkthroughs',
};

interface Options {
    root?: string | undefined;
}

function updateContributionsFromClient(packageJson: PackageJson) {
    const contributes = packageJson.contributes as IExtensionContributions;

    const keys = Object.values(contribKeys);

    for (const key of keys) {
        updateValue(contributes, clientContributions, key);
    }
}

function updateValue<K extends keyof ContribKeyMap>(target: IExtensionContributions, source: IExtensionContributions, key: K) {
    if (source[key]) {
        target[key] = source[key];
    }
}

async function updatePackageCSpellSchema(packageJson: PackageJson, schemaFile: string): Promise<void> {
    const schemaJson: JSONSchema7 = JSON.parse(await fs.readFile(schemaFile, 'utf8'));
    normalizeDescriptions(schemaJson);
    packageJson.contributes.configuration = update(schemaJson);
}

export async function action(packageFile: string, schemaFile: string, options: Options): Promise<void> {
    const cwd = Path.resolve(options.root || process.cwd());

    const _packageFile = Path.resolve(cwd, packageFile);
    const _schemaFile = Path.resolve(cwd, schemaFile);

    console.log(`
Update Package CSpell Schema
  Package File: ${Path.resolve(_packageFile)}
  Schema File: ${Path.resolve(_schemaFile)}
`);

    const packageJson: PackageJson = JSON.parse(await fs.readFile(_packageFile, 'utf8'));

    updateContributionsFromClient(packageJson);
    await updatePackageCSpellSchema(packageJson, _schemaFile);

    await fs.writeFile(_packageFile, JSON.stringify(packageJson, undefined, 2).concat('\n'));
}

function update(schema: JSONSchema7) {
    if (schema.items) return schema.items;
    return {
        properties: schema.properties,
    };
}

interface PackageJsonContributes extends Omit<IExtensionContributions, 'configuration'> {
    configuration: JSONSchema7Definition | JSONSchema7Definition[];
}

interface PackageJson {
    contributes: PackageJsonContributes;
}
