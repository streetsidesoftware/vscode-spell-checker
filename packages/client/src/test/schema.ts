import { promises as fs } from 'node:fs';
import * as path from 'node:path';

export const schemaFile = path.join(__dirname, '../../../_server/spell-checker-config.schema.json');

export async function readExtensionSchema(): Promise<Item> {
    const schema = await readJsonFile(schemaFile);
    return schema;
}

async function readJsonFile(filename: string) {
    return JSON.parse(await fs.readFile(filename, 'utf8'));
}

export async function readDefaults(): Promise<Map<string, unknown | undefined>> {
    const schema = await readExtensionSchema();

    const items = Array.isArray(schema.items) ? schema.items : schema.items ? [schema.items] : [];

    const results = new Map<string, unknown | undefined>();

    function processItem(item: Item) {
        if (!item.properties) return;
        Object.entries(item.properties).forEach(([k, v]) => results.set(k, v.default));
    }

    items.forEach((element) => processItem(element));

    return results;
}

interface Item {
    properties?: Record<string, Item>;
    items?: Item | Item[];
    default?: unknown;
}
