// @ts-check
import { promises as fs } from 'node:fs';

/**
 * JSONSchema4.
 * @typedef {import('json-schema').JSONSchema4} JSONSchema4
 */

/**
 * JSON Schema primitive types
 * @typedef {import('json-schema').JSONSchema4Type} JSONSchema4Type
 */

/**
 * @typedef {import('json-schema').JSONSchema4TypeName} JSONSchema4TypeName
 */

/**
 * The Schema File URL
 */
const schemaFile = new URL('../../packages/_server/spell-checker-config.schema.json', import.meta.url);
const descriptionWidth = 90;
const compare = new Intl.Collator().compare;

async function run() {
    const configSections = await loadSchema();

    if (!Array.isArray(configSections)) {
        return;
    }

    configSections.sort((a, b) => a.order - b.order || compare(a.title, b.title));

    const doc = `
<!--- AUTO-GENERATED ALL CHANGES WILL BE LOST --->

# Configuration Settings

${sectionTOC(configSections)}

${formatSections(configSections)}

`.replace(/\u200B/g, ''); // remove zero width spaces

    console.log(doc);

    /**
     * @param {JSONSchema4[]} sections
     * @returns
     */
    function sectionTOC(sections) {
        /**
         *
         * @param {JSONSchema4} value
         * @returns
         */
        function tocEntry(value) {
            const title = value.title;
            return `- [${title}](#${title.toLowerCase().replace(/\W+/g, '-')})`;
        }

        return `\n${sections.map(tocEntry).join('\n')}\n`;
    }
}

/**
 *
 * @param {JSONSchema4[]} sections
 * @returns
 */
function formatSections(sections) {
    return sections.map(sectionEntry).join('\n');
}

/**
 * @param {JSONSchema4} section
 * @returns
 */
function sectionEntry(section) {
    const entries = Object.entries(section.properties);
    entries.sort(([a], [b]) => compare(a, b));
    const activeEntries = entries.filter(([, value]) => !value.deprecationMessage);

    return `
# ${section.title}

${configTable(activeEntries)}

## Definitions

${configDefinitions(entries)}

`;
}

/**
 *
 * @param {[string, JSONSchema4][]} entries
 * @returns
 */
function configTable(entries) {
    /**
     *
     * @param {[string, any]} param0
     * @returns
     */
    function tableEntryConfig([key, value]) {
        const description =
            value.title ||
            value.description?.replace(/\n/g, '<br>') ||
            value.markdownDescription?.replace(/\n[\s\S]*/g, ' ') ||
            '';
        const scope = value.scope || '';
        return `| [\`${shorten(key, 60)}\`](#${key.toLowerCase().replace(/\W/g, '')}) | ${scope} | ${shortenLine(
            description,
            descriptionWidth,
        )} |`;
    }

    return `
| Setting | Scope | Description |
| ------- | ----- | ----------- |
${entries.map(tableEntryConfig).join('\n')}
`;
}

/**
 *
 * @param {string} line
 * @param {number} len
 * @returns
 */
function shortenLine(line, len) {
    const lines = line.split('<br>');
    if (lines.length > 1) return shortenLine(lines[0], len);
    if (line.length <= len) return line;

    const isSpace = /\s/;

    let i = len;
    while (i < line.length && !isSpace.test(line[i])) {
        ++i;
    }
    return i < line.length ? line.slice(0, i) + '…' : line;
}

/**
 *
 * @param {[string, JSONSchema4][]} entries
 * @returns
 */
function configDefinitions(entries) {
    return entries.map(definition).join('\n');
}

/**
 *
 * @param {[string, JSONSchema4]} entry
 * @returns
 */
function definition(entry) {
    const [key, value] = entry;
    const description = value.markdownDescription || value.description || value.title || '';
    const since = value.since || '';
    const defaultValue = formatDefaultValue(value.default);

    const title = value.title ? `-- ${value.title}` : '';
    let name = '`' + key + '`';
    if (value.deprecationMessage) {
        name = '~~' + name + '~~';
    }

    const deprecationMessage = value.deprecationMessage
        ? singleDef('Deprecation Message', value.deprecationMessage)
        : '';

    return `
### ${name}

${singleDef('Name', `${name} ${title}`)}

${singleDef('Type', formatType(value))}

${singleDef('Scope', value.scope || '')}

${singleDef('Description', description)}

${deprecationMessage}

${singleDef('Default', defaultValue)}

${since ? singleDef('Since Version', since) : ''}

---
`;
}

/**
 *
 * @param {string} term
 * @param {string} def
 * @returns
 */
function singleDef(term, def) {
    return `${term}\n: ${def.replace(/\n/g, '\n    ')}`;
}

/**
 *
 * @param {JSONSchema4Type} value
 * @returns
 */
function formatDefaultValue(value) {
    if (value === undefined) return '_- none -_';

    if (Array.isArray(value)) {
        return '[ ' + value.map(formatDefaultValue).join(', ') + ' ]';
    }

    return '_`' + JSON.stringify(value) + '`_';
}

/**
 *
 * @param {JSONSchema4} def
 * @returns {string}
 */
function extractTypeAndFormat(def) {
    return formatExtractedType(extractType(def));
}

/**
 *
 * @param {string | string[]} types
 */
function formatExtractedType(types) {
    if (!Array.isArray(types)) return types;
    if (types.length === 1) return types[0];
    return '( ' + types.join(' | ') + ' )';
}

/**
 * @param {JSONSchema4} def
 * @returns {string | string[]}
 */
function extractType(def) {
    if (def.type === 'array') return extractTypeAndFormat(def.items) + '[]';

    if (def.enum) {
        return def.enum.map((v) => JSON.stringify(v));
    }

    if (def.type) return def.type;

    if (Array.isArray(def.anyOf)) {
        const types = [...new Set(def.anyOf.map(extractType).flat())];
        if (types.length === 1) return types[0];
        return types;
    }

    return '';
}

/**
 *
 * @param {JSONSchema4} def
 * @returns {string}
 */
function extractEnumDescriptions(def) {
    if (!def.enumDescriptions || !def.enum) return '';

    const defs = def.enum
        .map((e, i) => [e, def.enumDescriptions[i] || '_No description_'])
        .map(([e, d]) => `| \`${e}\` | ${d.replace(/\n/g, '<br>')} |`)
        .join('\n');

    return `

${defs}
`;
}

/**
 *
 * @param {JSONSchema4} def
 * @returns
 */
function formatType(def) {
    const type = extractTypeAndFormat(def);
    const enumDefs = extractEnumDescriptions(def);
    return '`' + type + '` ' + enumDefs;
}

/**
 *
 * @param {string} text
 * @param {number} len
 */
function shorten(text, len) {
    return text.length <= len ? text : text.slice(0, len - 1) + '…';
}

/**
 * @returns {Promise<JSONSchema4['items'] | Pick<JSONSchema4, 'properties'>>}
 */
async function loadSchema() {
    const schema = JSON.parse(await fs.readFile(schemaFile, 'utf8'));

    if (schema.items) return schema.items;
    return {
        properties: schema.properties,
    };
}

run();
