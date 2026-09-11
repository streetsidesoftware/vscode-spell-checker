import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const schemaFile: string = path.join(__dirname, '../../spell-checker-config.schema.json');

const cSpellPrefix = 'cSpell.';

interface SchemaProperty {
    default?: unknown;
}

interface SchemaGroup {
    properties?: Record<string, SchemaProperty>;
}

interface Schema {
    items: SchemaGroup[];
}

/**
 * Extract the default value of every `cSpell.*` property found in the schema's
 * groups (`items[].properties`). Properties without a `default` are skipped.
 * The `cSpell.` prefix is stripped from the returned keys.
 */
export function extractCSpellDefaults(schema: Schema): Record<string, unknown> {
    const defaults: Record<string, unknown> = {};

    for (const group of schema.items) {
        for (const [key, property] of Object.entries(group.properties ?? {})) {
            if (!key.startsWith(cSpellPrefix) || !('default' in property)) continue;
            defaults[key.slice(cSpellPrefix.length)] = property.default;
        }
    }

    return defaults;
}

export async function readSchemaDefaults(file: string = schemaFile): Promise<Record<string, unknown>> {
    const content = await fs.readFile(file, 'utf8');
    const schema = JSON.parse(content) as Schema;
    return extractCSpellDefaults(schema);
}
