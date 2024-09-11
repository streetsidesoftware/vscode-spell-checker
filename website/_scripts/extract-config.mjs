// @ts-check
import { promises as fs } from 'node:fs';
import { unindent } from './lib/utils.mjs';

const targetDir = new URL('../docs/configuration/', import.meta.url);

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
 * @typedef {{[key: string]: string}} TypeSlugRefs
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

    const refs = extractTypeRefs(configSections);

    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(new URL('index.md', targetDir), genIndex(configSections));
    for (const section of formatSections(configSections, refs)) {
        await fs.writeFile(new URL(`auto_${section.slug}.md`, targetDir), section.content);
    }
}

/**
 *
 * @param {JSONSchema4[]} configSections
 * @returns {string}
 */
function genIndex(configSections) {
    return unindent`\
        ---
        # AUTO-GENERATED ALL CHANGES WILL BE LOST
        # See \`_scripts/extract-config.mjs\`
        title: Configuration
        id: configuration
        ---

        # Configuration Settings

        ${sectionTOC(configSections)}
    `;
}

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
        const description = value.description ? ` - ${value.description}` : '';
        return `- [${title}](configuration/${slugifyTitle(title)}) ${description}`.trim();
    }

    return `\n${sections
        .map(tocEntry)
        .filter((a) => !!a)
        .join('\n')}\n`;
}

/**
 *
 * @param {JSONSchema4[]} sections
 * @param {TypeSlugRefs} refs
 * @returns {{ title: string; content: string, slug: string }[]}
 */
function formatSections(sections, refs) {
    return sections.map((s) => formatSectionContent(s, refs));
}

/**
 * @param {JSONSchema4} section
 * @param {TypeSlugRefs} refs
 * @returns {{ title: string; content: string, slug: string }}
 */
function formatSectionContent(section, refs) {
    const entries = Object.entries(section.properties || {});
    entries.sort(compareProperties);
    const activeEntries = entries.filter(([, value]) => !value.deprecationMessage);

    const slug = slugifyTitle(section.title);
    const content = unindent`\
        ---
        # AUTO-GENERATED ALL CHANGES WILL BE LOST
        # See \`_scripts/extract-config.mjs\`
        title: ${section.title}
        id: ${slugify(section.title)}
        ---

        # ${section.title}

        ${section.description || ''}

        ${configTable(activeEntries)}

        ## Settings

        ${configDefinitions(entries, refs)}

    `;

    return { title: section.title, content, slug };
}

/**
 * @param {JSONSchema4[]} configSections
 * @returns {TypeSlugRefs}
 */
function extractTypeRefs(configSections) {
    /** @type {TypeSlugRefs} */
    const refs = {};
    for (const section of configSections) {
        for (const key of Object.keys(section.properties || {})) {
            refs[key] ??= slugifyTitle(section.title) + hashRef(key);
        }
    }
    return refs;
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

    return unindent`
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
 * @param {TypeSlugRefs} refs
 * @returns
 */
function configDefinitions(entries, refs) {
    return entries.map((def) => definition(def, refs)).join('\n');
}

/**
 *
 * @param {[string, JSONSchema4]} entry
 * @param {TypeSlugRefs} refs
 * @returns
 */
function definition(entry, refs) {
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

    return unindent`
        ### ${name}

        <dl>

        ${singleDef('Name', `${name} ${title}`)}

        ${singleDef('Description', fixVSCodeRefs(description, refs))}

        ${singleDef('Type', formatType(value), true)}

        ${singleDef('Scope', scopeDef(value.scope) || '_- none -_')}

        ${deprecationMessage}

        ${singleDef('Default', defaultValue, true)}

        ${since ? singleDef('Since Version', since) : ''}

        </dl>

        ---
    `;
}

/**
 *
 * @param {string} scope
 * @returns {string}
 */
function scopeDef(scope) {
    /*
    A configuration setting can have one of the following possible scopes:
    application - Settings that apply to all instances of VS Code and can only be configured in user settings.
    machine - Machine specific settings that can be set only in user settings or only in remote settings. For example, an installation path which shouldn't be shared across machines.
    machine-overridable - Machine specific settings that can be overridden by workspace or folder settings.
    window - Windows (instance) specific settings which can be configured in user, workspace, or remote settings.
    resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.
    language-overridable - Resource settings that can be overridable at a language level.
    */
    const scopes = {
        application: 'Settings that apply to all instances of VS Code and can only be configured in user settings.',
        machine:
            'Machine specific settings that can be set only in user settings or only in remote settings.\n' +
            "For example, an installation path which shouldn't be shared across machines.",
        'machine-overridable': 'Machine specific settings that can be overridden by workspace or folder settings.',
        window: 'Windows (instance) specific settings which can be configured in user, workspace, or remote settings.',
        resource:
            'Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.',
        'language-overridable': 'Resource settings that can be overridable at a language level.',
    };

    const desc = scopes[scope];

    return desc ? `${scope} - ${desc}` : scope;
}

/**
 *
 * @param {string} markdown
 * @param {TypeSlugRefs} refs
 * @returns {string}
 */
function fixVSCodeRefs(markdown, refs) {
    return markdown.replaceAll(/`#(.*?)#`/g, (_, p1) => `[\`${p1}\`](${refs[p1] || hashRef(p1)})`);
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
 * @param {string} sectionTitle
 * @returns {string}
 */
function slugifyTitle(sectionTitle) {
    return slugify(sectionTitle);
}

/**
 *
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
    return text.toLowerCase().replaceAll('.', '').replaceAll(/\W+/g, '-');
}

/**
 *
 * @param {string} heading
 * @returns {string}
 */
function hashRef(heading) {
    return '#' + slugify(heading);
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

    return unindent`
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
