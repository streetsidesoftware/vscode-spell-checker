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
    const { properties = {} } = packageConfig;
    const newProps: Record<string, JSONSchema7Definition> = {};

    // Try to keep the order by first copying the existing properties
    for (const key of Object.keys(properties)) {
        if (schema.properties?.[key] === undefined) continue;
        newProps[key] = copyProperty(properties[key], schema.properties[key]);
    }

    // Now copy the rest.
    for (const [key, value] of props) {
        newProps[key] = copyProperty(properties[key], value);
    }

    packageConfig.properties = newProps;
}

/**
 * Copy the source onto the destination while trying to preserve the order of the
 * existing fields.
 * @param current - current
 * @param value
 * @returns
 */
function copyProperty(current: JSONSchema7Definition | undefined, value: JSONSchema7Definition): JSONSchema7Definition {
    if (typeof current !== 'object') return value;
    if (typeof value !== 'object') return value;

    if (deepEqual(current, value)) return current;

    // The idea here is to try and preserve the key order
    const r: JSONSchema7 = {};
    const rr: Record<string, any> = r;

    for (const key of Object.keys(current) as (keyof JSONSchema7)[]) {
        if (value[key] === undefined) continue;
        rr[key] = value[key];
    }

    for (const key of Object.keys(value) as (keyof JSONSchema7)[]) {
        rr[key] = value[key];
    }

    return r;
}

interface PackageJson {
    contributes: {
        configuration: JSONSchema7;
    };
}
