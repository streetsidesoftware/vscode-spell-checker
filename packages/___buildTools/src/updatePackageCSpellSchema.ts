import { Command } from 'commander';
import * as fs from 'fs/promises';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import * as Path from 'path';

import { normalizeDescriptions } from './normalizeDescriptions.js';

export function commandUpdatePackageCSpellSchema(): Command {
    const command = new Command('update-package-schema');

    command
        .argument('[package]', 'Path to package.json', './package.json')
        .argument('[schema-file]', 'Path to .schema.json file.', './packages/_server/spell-checker-config.schema.json')
        .option('-r, --root <path>', 'Directory to use as the current directory.')
        .action(updatePackageCSpellSchema);

    return command;
}

interface Options {
    root?: string | undefined;
}

export async function updatePackageCSpellSchema(packageFile: string, schemaFile: string, options: Options): Promise<void> {
    const cwd = Path.resolve(options.root || process.cwd());

    const _packageFile = Path.resolve(cwd, packageFile);
    const _schemaFile = Path.resolve(cwd, schemaFile);

    console.log(`
Update Package Cspell Schema
  Package File: ${Path.resolve(_packageFile)}
  Schema File: ${Path.resolve(_schemaFile)}
`);

    const packageJson: PackageJson = JSON.parse(await fs.readFile(_packageFile, 'utf8'));
    const schemaJson: JSONSchema7 = JSON.parse(await fs.readFile(_schemaFile, 'utf8'));

    normalizeDescriptions(schemaJson);

    packageJson.contributes.configuration = update(schemaJson);

    await fs.writeFile(_packageFile, JSON.stringify(packageJson, undefined, 2).concat('\n'));
}

function update(schema: JSONSchema7) {
    if (schema.items) return schema.items;
    return {
        properties: schema.properties,
    };
}

interface PackageJson {
    contributes: {
        configuration: JSONSchema7Definition | JSONSchema7Definition[];
    };
}
