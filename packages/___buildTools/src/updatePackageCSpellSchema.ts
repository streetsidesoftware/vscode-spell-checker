import { Command } from 'commander';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import * as fs from 'fs/promises';
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

    const configuration = packageJson.contributes.configuration;

    update(configuration, schemaJson);

    await fs.writeFile(packageFile, JSON.stringify(packageJson, undefined, 2).concat('\n'));
}

function update(packageConfig: JSONSchema7, schema: JSONSchema7) {
    const props = Object.entries(schema.properties || {}).map(
        ([key, value]) => ['cSpell.' + key, value] as [string, JSONSchema7Definition]
    );
    const { properties = {} } = packageConfig;

    for (const [key, value] of props) {
        properties[key] = value;
    }

    packageConfig.properties = properties;
}

interface PackageJson {
    contributes: {
        configuration: JSONSchema7;
    };
}
