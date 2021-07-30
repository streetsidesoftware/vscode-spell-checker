import { Command } from 'commander';
import deepEqual from 'deep-equal';
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
    const propsMap = new Map(props);
    const { properties = {} } = packageConfig;

    for (const [key, value] of props) {
        properties[key] = copyProperty(properties[key], value);
    }

    // Remove unknown properties
    for (const [key] of Object.entries(properties)) {
        if (!propsMap.has(key)) delete properties[key];
    }

    packageConfig.properties = properties;
}

/**
 * Copy the source onto the destination while trying to preserve the order of the
 * existing fields.
 * @param current - current - is MODIFIED!!!
 * @param value
 * @returns
 */
function copyProperty(current: JSONSchema7Definition | undefined, value: JSONSchema7Definition): JSONSchema7Definition {
    if (typeof current !== 'object') return value;
    if (typeof value !== 'object') return value;

    if (deepEqual(current, value)) return current;

    const newKeys = new Set(Object.keys(value) as (keyof JSONSchema7)[]);
    // Alias of current to make types easier.
    const rr: Partial<Record<string, any>> = current;

    for (const key of newKeys) {
        rr[key] = value[key];
    }

    for (const key of Object.keys(rr)) {
        if (!newKeys.has(key as keyof JSONSchema7)) delete rr[key];
    }

    return current;
}

interface PackageJson {
    contributes: {
        configuration: JSONSchema7;
    };
}
