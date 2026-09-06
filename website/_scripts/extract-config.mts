import { promises as fs } from 'node:fs';
import type { JSONSchema4, JSONSchema4Type } from 'json-schema';
import { unindent } from './lib/utils.mts';
import { resolve } from 'node:path';

type TypeSlugRefs = { [key: string]: string };

/**
 * The Schema File URL
 */
const schemaFile = new URL('../../packages/_server/spell-checker-config-web.schema.json', import.meta.url);
const descriptionWidth = 90;
const compare = new Intl.Collator().compare;
const targetDir = new URL('../docs/configuration/', import.meta.url);

class ConfigExtractor {
    private root: JSONSchema4;
    private configSections: JSONSchema4[];
    private refs: TypeSlugRefs;
    constructor(root: JSONSchema4) {
        this.root = root;
        this.configSections = this.#extractConfigSections();
        this.refs = this.#extractTypeRefs(this.configSections);
    }

    #extractConfigSections(): JSONSchema4[] {
        const root = this.root;
        const configSections = this.#resolve(this.root).items;
        if (!Array.isArray(configSections)) return [];
        const resolved = configSections.map((s) => this.#resolve(s, hasTitle));
        resolved.sort((a, b) => (a.order || 0) - (b.order || 0) || compare(a.title || '', b.title || ''));
        return resolved;
    }

    #extractTypeRefs(configSections: JSONSchema4[]): TypeSlugRefs {
        const refs: TypeSlugRefs = {};
        for (const section of configSections) {
            const title = section.title || '';
            const props = this.#resolve(section, hasProperties).properties || {};
            for (const key of Object.keys(props)) {
                refs[key] ??= slugifyTitle(title) + hashRef(key);
            }
        }
        return refs;
    }

    #resolve($ref: JSONSchema4 | string, stopPredicate?: (schema: JSONSchema4) => boolean): JSONSchema4 {
        let ref = typeof $ref === 'string' ? { $ref } : $ref;
        while (ref.$ref && !stopPredicate?.(ref)) {
            ref = resolveRef(this.root, ref);
        }
        return ref;
    }

    genIndex(): string {
        return this.#genIndex(this.configSections);
    }

    #genIndex(configSections: JSONSchema4[]): string {
        return unindent`\
            ---
            # AUTO-GENERATED ALL CHANGES WILL BE LOST
            # See \`_scripts/extract-config.mts\`
            title: Configuration
            id: configuration
            ---

            # Configuration Settings

            ${this.#sectionTOC(configSections)}
        `;
    }

    #tocEntry(value: JSONSchema4): string {
        if (!value.title) return '';
        const title = value.title;
        const description = value.description ? ` - ${value.description}` : '';
        return `- [${title}](configuration/${slugifyTitle(title)}) ${description}`.trim();
    }

    #sectionTOC(sections: JSONSchema4[]): string {
        return `\n${sections
            .map((v) => this.#tocEntry(v))
            .filter((a) => !!a)
            .join('\n')}\n`;
    }

    #formatSections(sections: JSONSchema4[], refs: TypeSlugRefs): FormattedSection[] {
        return sections.map((s) => this.#formatSectionContent(s, refs));
    }

    #formatSectionContent(section: JSONSchema4, refs: TypeSlugRefs): FormattedSection {
        const resolvedSection = this.#resolve(section, hasProperties);
        const entries = Object.entries(resolvedSection.properties || {});
        entries.sort((a, b) => this.#compareProperties(a, b));
        const activeEntries = entries.filter(([, value]) => !value.deprecationMessage);

        const title = section.title || '';
        const slug = slugifyTitle(title);
        const content = unindent`\
            ---
            # AUTO-GENERATED ALL CHANGES WILL BE LOST
            # See \`_scripts/extract-config.mts\`
            title: ${title}
            id: ${slugify(title)}
            ---

            # ${title}

            ${section.description || ''}

            ${this.#configTable(activeEntries, refs)}

            ## Settings

            ${this.#configDefinitions(entries, refs)}

        `;

        return { title, content, slug };
    }

    #configDefinitions(entries: [string, JSONSchema4][], refs: TypeSlugRefs): string {
        return entries.map((def) => this.#definition(def, refs)).join('\n');
    }

    #definition(entry: [string, JSONSchema4], refs: TypeSlugRefs): string {
        const [key, value] = entry;
        const description = value.markdownDescription || value.description || value.title || '';
        const since = value.sinceVersion || '';
        const sinceCSpellVersion = value.since || '';
        const defaultValue = this.#formatDefaultValue(value.default);

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

            ${singleDef('Type', this.#formatType(value), true)}

            ${singleDef('Scope', scopeDef(value.scope) || '_- none -_')}

            ${deprecationMessage}

            ${singleDef('Default', defaultValue, true)}

            ${since ? singleDef('Since Extension Version', since) : ''}

            ${sinceCSpellVersion ? singleDef('CSpell Version', sinceCSpellVersion) : ''}

            </dl>

            ---
        `.replace(/\n{3,}/g, '\n\n'); // Remove extra blank lines
    }

    formatSections(): FormattedSection[] {
        return this.#formatSections(this.configSections, this.refs);
    }

    #innerFormatDefaultValue(value: JSONSchema4Type | undefined): string {
        if (value === undefined) return '';

        if (Array.isArray(value)) {
            return '[ ' + value.map((v) => this.#innerFormatDefaultValue(v)).join(', ') + ' ]';
        }

        return JSON.stringify(value);
    }

    #formatDefaultValue(value: JSONSchema4Type | undefined): string {
        if (value === undefined) return '_- none -_';

        const text = beautifyJSON(this.#innerFormatDefaultValue(value), 80);
        const lines = text.split('\n');
        if (lines.length > 1) {
            // console.error('%o', lines);
            return '\n```json5\n' + text + '\n```\n';
        }

        return '_`' + text + '`_';
    }

    #formatType(def: JSONSchema4): string {
        const typeLines = beautifyType(this.#extractTypeAndFormat(def), 80);
        const types = typeLines.length > 1 ? 'definition\n```\n' + typeLines.join('\n') + '\n```\n' : '`' + typeLines[0] + '`';
        const enumDefs = this.#extractEnumDescriptions(def);
        return types + enumDefs;
    }

    #extractEnumDescriptions(def: JSONSchema4): string {
        const enumDef = this.#resolve(def);
        if (!def.enumDescriptions || !enumDef.enum) return '';

        const defs = enumDef.enum
            .map((e, i) => [e, def.enumDescriptions?.[i] || '_No description_'])
            .map(([e, d]) => `| \`${e}\` | ${(d as string).replace(/\n/g, '<br>')} |`)
            .join('\n');

        return unindent`
            | Value | Description |
            | ----- | ----------- |
            ${defs}
        `;
    }

    #extractTypeAndFormat(def: JSONSchema4 | undefined): string {
        return formatExtractedType(this.#extractType(def));
    }

    #extractType(def: JSONSchema4 | undefined): string | string[] {
        def = def && this.#resolve(def);
        if (!def) return '';
        if (def.type === 'array') return this.#extractTypeAndFormat(def.items) + '[]';

        if (def.enum) {
            return def.enum.map((v) => JSON.stringify(v));
        }

        if (def.type) return def.type;

        if (Array.isArray(def.anyOf)) {
            const types = [...new Set(def.anyOf.map((t) => this.#extractType(t)).flat())];
            if (types.length === 1) return types[0];
            return types;
        }

        return '';
    }

    /**
     * Sort properties by name, with deprecated properties last.
     */
    #compareProperties(a: [string, JSONSchema4], b: [string, JSONSchema4]): number {
        const dA = a[1].deprecationMessage || a[1].deprecated ? 1 : 0;
        const dB = b[1].deprecationMessage || b[1].deprecated ? 1 : 0;
        return dA - dB || compare(a[0], b[0]);
    }

    #configTable(entries: [string, JSONSchema4][], refs: TypeSlugRefs): string {
        function tableEntryConfig([key, value]: [string, JSONSchema4]): string {
            const description = fixVSCodeRefs(
                value.title || value.description?.replace(/\n/g, '<br>') || value.markdownDescription?.replace(/\n[\s\S]*/g, ' ') || '',
                refs,
            );
            const scope = value.scope || '';
            return `| [\`${shorten(key, 60)}\`](${hashRef(key)}) | ${scope} | ${shortenLine(description, descriptionWidth)} |`;
        }

        return unindent`
            | Setting | Scope | Description |
            | ------- | ----- | ----------- |
            ${entries.map(tableEntryConfig).join('\n')}
        `;
    }
}

async function run(): Promise<void> {
    const root = await loadSchema();

    const extractor = new ConfigExtractor(root);

    const configSections = await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(new URL('index.md', targetDir), extractor.genIndex());
    for (const section of extractor.formatSections()) {
        await fs.writeFile(new URL(`auto_${section.slug}.md`, targetDir), section.content);
    }
}

function hasTitle(schema: JSONSchema4): boolean {
    return schema.title !== undefined;
}

function hasProperties(schema: JSONSchema4): boolean {
    return !!schema.properties;
}

interface FormattedSection {
    title: string;
    content: string;
    slug: string;
}

function shortenLine(line: string, len: number): string {
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

function scopeDef(scope: string | undefined): string | undefined {
    /*
    A configuration setting can have one of the following possible scopes:
    application - Settings that apply to all instances of VS Code and can only be configured in user settings.
    machine - Machine specific settings that can be set only in user settings or only in remote settings. For example, an installation path which shouldn't be shared across machines.
    machine-overridable - Machine specific settings that can be overridden by workspace or folder settings.
    window - Windows (instance) specific settings which can be configured in user, workspace, or remote settings.
    resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.
    language-overridable - Resource settings that can be overridable at a language level.
    */
    const scopes: Record<string, string> = {
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

    if (!scope) return scope;

    const desc = scopes[scope];

    return desc ? `${scope} - ${desc}` : scope;
}

function fixVSCodeRefs(markdown: string, refs: TypeSlugRefs): string {
    return markdown.replaceAll(/`#(.*?)#`/g, (_, p1) => `[\`${p1}\`](${refs[p1] || hashRef(p1)})`);
}

function singleDef(term: string, def: string, _addIgnore = false): string {
    const lines: string[] = [];

    const defLines = def.replaceAll('`jsonc', '`json5');
    const termDef = `<dt>\n${term}\n</dt>\n<dd>\n\n${defLines}\n\n</dd>\n`;
    const termLines = termDef.split('\n').map((line) => line.trimEnd());

    lines.push(...termLines);

    return lines.join('\n');
}

function slugifyTitle(sectionTitle: string): string {
    return slugify(sectionTitle);
}

function slugify(text: string): string {
    return text.toLowerCase().replaceAll('.', '').replaceAll(/\W+/g, '-');
}

function hashRef(heading: string): string {
    return '#' + slugify(heading);
}

function formatExtractedType(types: string | string[]): string {
    if (!Array.isArray(types)) return types;
    if (types.length === 1) return types[0];
    return '( ' + types.join(' | ') + ' )';
}

function shorten(text: string, len: number): string {
    return text.length <= len ? text : text.slice(0, len - 1) + '…';
}

async function loadSchema(): Promise<JSONSchema4> {
    const schema: JSONSchema4 = JSON.parse(await fs.readFile(schemaFile, 'utf8'));
    return schema;
}

/**
 * Resolve a top-level `$ref` (e.g. `#/definitions/Foo`) against the root schema document.
 */
function resolveRef(root: JSONSchema4, ref: JSONSchema4): JSONSchema4 {
    if (!ref.$ref) return ref;

    const path = ref.$ref.replace(/^#\//, '').split('/').map(decodeURIComponent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolved = path.reduce<any>((node, key) => node?.[key], root);
    if (!resolved) {
        throw new Error(`Unable to resolve $ref: ${ref.$ref}`);
    }

    return resolved;
}

function beautifyJSON(json: string, width: number): string {
    if (json.length < width) return json;

    const lines: string[] = [];
    let line = '';

    function addToLine(...items: string[]): void {
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

function beautifyType(dataType: string, width: number): string[] {
    if (dataType.length < width) return [dataType];

    const lines: string[] = [];
    let line = '';

    function addToLine(...items: string[]): void {
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

await run();
