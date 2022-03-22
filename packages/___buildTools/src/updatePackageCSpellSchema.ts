import { Command } from 'commander';
import * as fs from 'fs/promises';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import * as Path from 'path';

export function commandUpdatePackageCSpellSchema(): Command {
    const command = new Command('update-package-schema');

    command
        .argument('[package]', 'Path to package.json', './package.json')
        .argument('[schema-file]', 'Path to .schema.json file.', './packages/_server/spell-checker-config.schema.json')
        .action(updatePackageCSpellSchema);

    return command;
}

export async function updatePackageCSpellSchema(packageFile: string, schemaFile: string): Promise<void> {
    console.log(`
Update Package Cspell Schema
  Package File: ${Path.resolve(packageFile)}
  Schema File: ${Path.resolve(schemaFile)}
`);

    const packageJson: PackageJson = JSON.parse(await fs.readFile(packageFile, 'utf8'));
    const schemaJson: JSONSchema7 = JSON.parse(await fs.readFile(schemaFile, 'utf8'));

    packageJson.contributes.configuration = update(schemaJson);

    await fs.writeFile(packageFile, JSON.stringify(packageJson, undefined, 2).concat('\n'));
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
