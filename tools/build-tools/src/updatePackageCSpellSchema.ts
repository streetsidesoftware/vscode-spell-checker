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

interface Options {
    root?: string | undefined;
}

function updateContributionsFromClient(packageJson: PackageJson) {
    const contributes = packageJson.contributes;
    if (clientContributions.commands) {
        contributes.commands = clientContributions.commands;
    }

    for (const [key, value] of Object.entries(clientContributions)) {
        contributes[key as keyof IExtensionContributions] = value;
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

interface PackageJson {
    contributes: Omit<IExtensionContributions, 'configuration'> & {
        configuration: JSONSchema7Definition | JSONSchema7Definition[];
    };
}
