import type { JSONSchema7 } from 'json-schema';
import traverse from 'json-schema-traverse';

type SchemaObj = traverse.SchemaObject;

export function normalizeDescriptions(schema: JSONSchema7) {
    function cb(schemaObj: SchemaObj, _jsonPtr: string) {
        // console.log('%o', { jsonPtr, keys: Object.keys(schemaObj) });

        if (!schemaObj.markdownDescription && !schemaObj.description) return;

        const newKeys = replaceKey(Object.keys(schemaObj), 'description', 'markdownDescription');
        schemaObj.markdownDescription = schemaObj.markdownDescription ?? schemaObj.description;
        schemaObj.markdownDescription?.replace(/\u200B/g, ''); // remove zero width spaces
        delete schemaObj.description;
        orderFieldsInObject(schemaObj, newKeys);
    }

    traverse(schema, { cb });
}

function replaceKey(keys: string[], replaceKey: string, withKeyName: string): string[] {
    const keyMap = new Map(keys.map((k) => [k, k]));
    if (!keyMap.has(replaceKey)) return keys;
    if (keyMap.has(withKeyName)) {
        keyMap.delete(replaceKey);
        return [...keyMap.values()];
    }

    keyMap.set(replaceKey, withKeyName);
    return [...keyMap.values()];
}

function orderFieldsInObject(obj: SchemaObj, keys: string[]) {
    const newObj = Object.fromEntries(keys.map((key) => [key, obj[key]]));

    // clean
    Object.keys(obj).forEach((key) => delete obj[key]);
    Object.assign(obj, newObj);
}
