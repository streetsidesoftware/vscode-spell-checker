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

    configSections.sort((a, b) => a.order - b.order || compare(a.title || '', b.title || ''));

    const doc = `\
---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See \`_scripts/extract-config.js\`
title: Configuration
slug: configuration
toc_max_heading_level: 5
---

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
            if (!value.title) return '';
            const title = value.title;
            return `- [${title}](${hashRef(title)})`;
        }

        return `\n${sections
            .map(tocEntry)
            .filter((a) => !!a)
            .join('\n')}\n`;
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
    const entries = Object.entries(section.properties || {});
    entries.sort(compareProperties);
    const activeEntries = entries.filter(([, value]) => !value.deprecationMessage);

    return `
## ${section.title}

${configTable(activeEntries)}

### Definitions

${configDefinitions(entries)}

`;
}

/**
 * Sort properties by name, with deprecated properties last.
 * @param {[string, JSONSchema4]} a
 * @param {[string, JSONSchema4]} b
 * @returns {number}
 */
function compareProperties(a, b) {
    const dA = a[1].deprecationMessage || a[1].deprecated ? 1 : 0;
    const dB = b[1].deprecationMessage || b[1].deprecated ? 1 : 0;
    return dA - dB || compare(a[0], b[0]);
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
            value.title || value.description?.replace(/\n/g, '<br>') || value.markdownDescription?.replace(/\n[\s\S]*/g, ' ') || '';
        const scope = value.scope || '';
        return `| [\`${shorten(key, 60)}\`](${hashRef(key)}) | ${scope} | ${shortenLine(description, descriptionWidth)} |`;
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

    const deprecationMessage = value.deprecationMessage ? singleDef('Deprecation Message', value.deprecationMessage) : '';

    return `
#### ${name}

<dl>

${singleDef('Name', `${name} ${title}`)}

${singleDef('Type', formatType(value), true)}

${singleDef('Scope', value.scope || '_- none -_')}

${singleDef('Description', fixVSCodeRefs(description))}

${deprecationMessage}

${singleDef('Default', defaultValue, true)}

${since ? singleDef('Since Version', since) : ''}

</dl>

---
`;
}

/**
 *
 * @param {string} markdown
 * @returns {string}
 */
function fixVSCodeRefs(markdown) {
    return markdown.replaceAll(/`#(.*?)#`/g, (match, p1) => `[\`${p1}\`](${hashRef(p1)})`);
}

/**
 *
 * @param {string} term
 * @param {string} def
 * @returns
 */
function singleDef(term, def, addIgnore = false) {
    const lines = [];

    const defLines = def.replaceAll('`jsonc', '`json5');
    const termDef = `<dt>\n${term}\n</dt>\n<dd>\n\n${defLines}\n\n</dd>\n`;
    const termLines = termDef.split('\n').map((line) => line.trimEnd());

    lines.push(...termLines);

    return lines.join('\n');
}

/**
 *
 * @param {JSONSchema4Type | undefined} value
 * @returns {string}
 */
function _formatDefaultValue(value) {
    if (value === undefined) return '';

    if (Array.isArray(value)) {
        return '[ ' + value.map(_formatDefaultValue).join(', ') + ' ]';
    }

    return JSON.stringify(value);
}

/**
 *
 * @param {JSONSchema4Type | undefined} value
 * @returns
 */
function formatDefaultValue(value) {
    if (value === undefined) return '_- none -_';

    const text = beautifyJSON(_formatDefaultValue(value), 80);
    const lines = text.split('\n');
    if (lines.length > 1) {
        // console.error('%o', lines);
        return '\n```json5\n' + text + '\n```\n';
    }

    return '_`' + text + '`_';
}

/**
 *
 * @param {string} heading
 * @returns {string}
 */
function hashRef(heading) {
    return '#' + heading.toLowerCase().replaceAll('.', '').replaceAll(/\W+/g, '-');
}

/**
 *
 * @param {JSONSchema4 | undefined} def
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
 * @param {JSONSchema4 | undefined} def
 * @returns {string | string[]}
 */
function extractType(def) {
    if (!def) return '';
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
| Value | Description |
| ----- | ----------- |
${defs}
`;
}

/**
 *
 * @param {JSONSchema4} def
 * @returns
 */
function formatType(def) {
    const typeLines = beautifyType(extractTypeAndFormat(def), 80);
    const types = typeLines.length > 1 ? 'definition\n```\n' + typeLines.join('\n') + '\n```\n' : '`' + typeLines[0] + '`';
    const enumDefs = extractEnumDescriptions(def);
    return types + enumDefs;
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

/**
 * @param {string} json
 * @param {number} width
 * @returns {string}
 */
function beautifyJSON(json, width) {
    if (json.length < width) return json;

    const lines = [];
    let line = '';

    /**
     *
     * @param  {...string} items
     * @returns {void}
     */
    function addToLine(...items) {
        for (const text of items) {
            if (text === '\n') {
                lines.push(line);
                line = '';
                continue;
            }
            if (line.length + text.length > width) {
                line && lines.push(line);
                line = '';
            }
            line += text;
        }
    }

    const obj = JSON.parse(json);
    if (typeof obj !== 'object') return json;
    if (Array.isArray(obj)) {
        addToLine('[', '\n');
        obj.forEach((item, index) => {
            addToLine(JSON.stringify(item) + (index === obj.length - 1 ? '' : ', '));
        });
        addToLine('\n', ']');
    } else if (typeof obj === 'object') {
        addToLine('{', '\n');
        const entries = Object.entries(obj);
        entries.forEach(([key, item], index) => {
            addToLine(JSON.stringify(key) + ': ', JSON.stringify(item) + (index === entries.length - 1 ? '' : ', '));
        });
        addToLine('\n', '}');
    }

    line && lines.push(line);

    // console.error('%o', lines);

    return lines.join('\n');
}

/**
 * @param {string} dataType
 * @param {number} width
 * @returns {string[]}
 */
function beautifyType(dataType, width) {
    if (dataType.length < width) return [dataType];

    const lines = [];
    let line = '';

    /**
     *
     * @param  {...string} items
     * @returns {void}
     */
    function addToLine(...items) {
        for (const text of items) {
            if (text === '\n') {
                lines.push(line);
                line = '';
                continue;
            }
            if (line.length + text.length > width) {
                line && lines.push(line);
                line = '';
            }
            line += text;
        }
    }

    const items = dataType.split('|');
    const fixed = items.map((item, index) => item + (index === items.length - 1 ? '' : ' |'));

    addToLine(...fixed);
    line && lines.push(line);

    // console.error('%o', lines);

    return lines;
}

run();
