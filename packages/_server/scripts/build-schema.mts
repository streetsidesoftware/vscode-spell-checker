import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import stringify from 'safe-stable-stringify';
import * as tsj from 'ts-json-schema-generator';

const rootDir = fileURLToPath(new URL('..', import.meta.url));

/**
 * Command Line Options
 * --tsconfig=./tsconfig.schema.json
 * --markdown-description
 * --no-top-ref
 * --expose none
 * --path src/config/cspellConfig/cspellConfig.mts
 * --type SpellCheckerSettingsVSCode
 * --validation-keywords markdownDescription
 * --validation-keywords scope
 * --validation-keywords patternErrorMessage
 * --validation-keywords deprecationMessage
 * --validation-keywords enumDescriptions
 * --validation-keywords deprecated
 * --validation-keywords order
 * --validation-keywords since
 * -o spell-checker-config.schema.json
 */
const config: tsj.Config = {
    path: p('src/config/cspellConfig/cspellConfig.mts'),
    tsconfig: p('tsconfig.schema.json'),
    type: 'SpellCheckerSettingsVSCode',
    topRef: false,
    expose: 'none',
    skipTypeCheck: true,
    markdownDescription: true,
    sortProps: true,
    extraTags: [
        'markdownDescription',
        'scope',
        'patternErrorMessage',
        'deprecationMessage',
        'enumDescriptions',
        'deprecated',
        'order',
        'since',
        'sinceVersion',
    ],
};

const configWeb: tsj.Config = {
    ...config,
    topRef: true,
    // expose: 'export',
};

function p(filePath: string): string {
    return path.resolve(rootDir, filePath);
}

function cleanJson(json: string): string {
    /** Remove zero width space */
    return json.replaceAll(/\u200B/g, '');
}

async function genSchema(config: tsj.Config, outputPath: string) {
    const schema = tsj.createGenerator(config).createSchema(config.type);
    const schemaString = stringify(schema, null, 2) + '\n';
    await fs.writeFile(outputPath, cleanJson(schemaString));
}

async function run() {
    await genSchema(config, p('spell-checker-config.schema.json'));
    await genSchema(configWeb, p('spell-checker-config-web.schema.json'));
}

run();
