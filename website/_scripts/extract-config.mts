import { promises as fs } from 'node:fs';
import type { JSONSchema4, JSONSchema4Type } from 'json-schema';
import { unindent } from './lib/utils.mts';
import type { TableHeader, TableRow } from './lib/mdTable.mts';
import { renderMarkdownTable, renderMarkdownTableHtml } from './lib/mdTable.mts';
import { mdDetails } from './lib/mdDetails.mts';
import { renderMarkdownDL, singleDef } from './lib/mdDL.mts';
import { mdList } from './lib/mdList.mts';

type TypeSlugRefs = { [key: string]: string };

type TypeNodePlain = { kind: 'plain'; text: string };
type TypeNodeArray = { kind: 'array'; item: TypeNode };
type TypeNodeTuple = { kind: 'tuple'; items: TypeNode[] };
type TypeNodeUnion = { kind: 'union'; options: TypeNode[] };
type TypeNodeRef = { kind: 'ref'; name: string };
type TypeNodeObject = { kind: 'object'; props: ObjectProp[]; indexSignature?: { keyType: string; value: TypeNode } };

/**
 * A simplified structural representation of a JSON Schema type, built by
 * resolving `$ref`s so that named object types can be detected and hoisted
 * out into a separate "Type Definitions" section, while inline (unnamed)
 * object types are expanded in place.
 */
type TypeNode = TypeNodePlain | TypeNodeArray | TypeNodeTuple | TypeNodeUnion | TypeNodeRef | TypeNodeObject;

interface CommonAttributes {
    title: string | undefined;
    description: string | undefined;
    defaultValue: string | undefined;
    since: string | undefined;
    sinceCSpellVersion: string | undefined;
    deprecationMessage: string | undefined;
}

interface ObjectProp extends CommonAttributes {
    key: string;
    type: TypeNode;
    optional: boolean;
}

interface NamedType extends CommonAttributes {
    node: TypeNode;
}

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
    /** Named object types encountered while formatting the current section, keyed by definition name. */
    private namedTypes: Map<string, NamedType> = new Map();
    /** Guards against infinite recursion when resolving a named type that (indirectly) references itself. */
    private namedTypesInProgress: Set<string> = new Set();
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

    #getAttribute(schema: JSONSchema4, attribute: string, defaultValue?: any): any {
        return this.#resolve(schema, hasAttribute(attribute))[attribute] ?? defaultValue;
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

    #formatSections(sections: JSONSchema4[]): FormattedSection[] {
        return sections.map((s) => this.#formatSectionContent(s));
    }

    #formatSectionContent(section: JSONSchema4): FormattedSection {
        const resolvedSection = this.#resolve(section, hasProperties);
        const entries = Object.entries(resolvedSection.properties || {});
        entries.sort((a, b) => this.#compareProperties(a, b));
        const activeEntries = entries.filter(([, value]) => !value.deprecationMessage);

        this.namedTypes = new Map();

        const title = section.title || '';
        const slug = slugifyTitle(title);
        const definitions = this.#configDefinitions(entries);
        const namedTypeDefinitions = this.#formatNamedTypeDefinitions();
        const content =
            unindent`\
                ---
                # AUTO-GENERATED ALL CHANGES WILL BE LOST
                # See \`_scripts/extract-config.mts\`
                title: ${title}
                id: ${slugify(title)}
                ---

                # ${title}

                ${section.markdownDescription || section.description || ''}

                ${this.#configTable(activeEntries)}

                ## Settings

                ${definitions}
            `.trimEnd() + (namedTypeDefinitions ? `\n\n${namedTypeDefinitions}\n\n\n` : '\n\n\n');

        return { title, content, slug };
    }

    #configDefinitions(entries: [string, JSONSchema4][]): string {
        return entries.map((def) => this.#definition(def)).join('\n');
    }

    #definition(entry: [string, JSONSchema4]): string {
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

        const def = unindent`
            ### ${name}

            <dl>

            ${singleDef('Name', `${name} ${title}`)}

            ${singleDef('Description', description)}

            ${singleDef('Type', this.#formatType(value))}

            ${singleDef('Scope', scopeDef(value.scope) || '_- none -_')}

            ${deprecationMessage}

            ${singleDef('Default', defaultValue)}

            ${since ? singleDef('Since Extension Version', since) : ''}

            ${sinceCSpellVersion ? singleDef('CSpell Version', sinceCSpellVersion) : ''}

            </dl>

            ---
        `;
        return this.#fixVSCodeRefs(def).replace(/\n{3,}/g, '\n\n'); // Remove extra blank lines
    }

    formatSections(): FormattedSection[] {
        return this.#formatSections(this.configSections);
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
            return '\n```json5 title="default"\n' + text + '\n```\n';
        }

        return '_`' + text + '`_';
    }

    #formatType(def: JSONSchema4): string {
        const node = this.#buildTypeNode(def);
        return this.#renderType(node) + this.#extractEnumDescriptions(def);
    }

    /**
     * Render the value used for a "Type" field: an inline, backtick-quoted type for a plain
     * type or a type that only involves links to named types (matching how the rest of this
     * file formats inline code, e.g. {@link fixVSCodeRefs}), or - when an inline object literal
     * is involved - a fenced code block, the same way {@link #formatDefaultValue} pretty-prints
     * multi-line default values.
     */
    #renderTypeFieldAsCode(node: TypeNode): string {
        if (containsObjectLiteral(node)) {
            return '\n```ts\n' + this.#renderTsType(node, 0) + '\n```\n';
        }

        if (containsRef(node)) {
            return this.#renderLinkedType(node);
        }

        const typeLines = beautifyType(this.#renderPlainTypeAsCode(node), 80);
        return typeLines.length > 1 ? '\n```ts\n' + typeLines.join('\n') + '\n```\n' : '`' + typeLines[0] + '`';
    }

    #renderType(node: TypeNode): string {
        const lines: string[] = [];
        const code = this.#renderTypeFieldAsCode(node);
        const numCodeLines = numLines(code);

        if (node.kind === 'array' && numCodeLines > 1) {
            lines.push('**Array of:**', '');
            lines.push(this.#renderType(node.item));
            return lines.join('\n');
        }

        if (node.kind === 'union') {
            lines.push('**Any of:**', '');
            const options = node.options.map((option) => this.#renderType(option));
            lines.push(mdList(options));
        }

        if (node.kind === 'object') {
            lines.push(this.#renderTypeNodeObjectAsTable(node));
        }

        lines.push(numCodeLines > 10 ? mdDetails('TypeScript:', code) : code);

        return lines.join('\n');
    }

    #extractEnumDescriptions(def: JSONSchema4): string {
        const enumDef = this.#resolve(def);
        if (!def.enumDescriptions || !enumDef.enum) return '';

        const rows: TableRow[] = enumDef.enum
            .map((e, i) => [e, def.enumDescriptions?.[i] || '_No description_'])
            .map(([e, d]) => [`\`${e}\``, `${(d as string).replace(/\n/g, '<br>')}`]);

        return renderMarkdownTable({ header: ['Value', 'Description'], rows });
    }

    /**
     * Build a structural {@link TypeNode} for a schema, resolving `$ref`s.
     *
     * A `$ref` to a named definition that turns out to be an object type (or a union that
     * involves one) is hoisted: it is registered in {@link namedTypes} and a `ref` node is
     * returned instead of inlining it, so that it can be rendered later in a "Type Definitions"
     * section. Inline (unnamed) object types are expanded in place as an `object` node.
     */
    #buildTypeNode(def: JSONSchema4 | undefined): TypeNode {
        if (!def) return { kind: 'plain', text: '' };

        if (def.$ref) {
            const name = refName(def.$ref);
            const { title, description, since, sinceCSpellVersion, deprecationMessage, defaultValue } = this.#extractCommonAttributes(def);
            const known = this.namedTypes.get(name);
            if (known) return { kind: 'ref', name };
            if (!isHoistableName(name) || this.namedTypesInProgress.has(name)) {
                return this.#buildTypeNodeRaw(resolveRef(this.root, def));
            }

            const resolved = this.#resolve(def);
            this.namedTypesInProgress.add(name);
            const inner = this.#buildTypeNodeRaw(resolved);
            this.namedTypesInProgress.delete(name);

            if (!containsComplexType(inner)) return inner;

            this.namedTypes.set(name, { node: inner, description, title, since, sinceCSpellVersion, deprecationMessage, defaultValue });
            return { kind: 'ref', name };
        }

        return this.#buildTypeNodeRaw(def);
    }

    #buildTypeNodeRaw(def: JSONSchema4): TypeNode {
        if (def.type === 'array') {
            if (Array.isArray(def.items)) {
                return { kind: 'tuple', items: def.items.map((t) => this.#buildTypeNode(t)) };
            }
            return { kind: 'array', item: this.#buildTypeNode(def.items) };
        }

        if (def.enum) {
            return { kind: 'union', options: def.enum.map((v): TypeNode => ({ kind: 'plain', text: JSON.stringify(v) })) };
        }

        if (def.type === 'object') {
            return this.#buildObjectNode(def);
        }

        if (Array.isArray(def.type)) {
            const options = def.type.map((t): TypeNode => ({ kind: 'plain', text: t }));
            return options.length === 1 ? options[0] : { kind: 'union', options };
        }

        if (def.type) return { kind: 'plain', text: def.type };

        // `{ "not": {} }` is the JSON Schema idiom for "matches nothing" (TypeScript's `never`),
        // commonly paired with other options in an `anyOf` to widen a string-literal union
        // without losing autocomplete (TypeScript's `SomeLiteral | (string & {})` trick).
        if (def.not) return { kind: 'plain', text: 'never' };

        if (Array.isArray(def.anyOf)) {
            const options = dedupeTypeNodes(def.anyOf.map((t) => this.#buildTypeNode(t)));
            // `T | never` is just `T`; drop `never` whenever another option is present.
            const meaningful = options.filter((o) => !(o.kind === 'plain' && o.text === 'never'));
            const result = meaningful.length ? meaningful : options;
            return result.length === 1 ? result[0] : { kind: 'union', options: result };
        }

        return { kind: 'plain', text: '' };
    }

    #buildObjectNode(def: JSONSchema4): TypeNode {
        const required = new Set(Array.isArray(def.required) ? def.required : []);
        const props: ObjectProp[] = Object.entries(def.properties || {}).map(([key, value]) => ({
            ...this.#extractCommonAttributes(value),
            key,
            type: this.#buildTypeNode(value),
            optional: !required.has(key),
        }));

        let indexSignature: { keyType: string; value: TypeNode } | undefined;
        if (def.additionalProperties && typeof def.additionalProperties === 'object') {
            indexSignature = { keyType: 'string', value: this.#buildTypeNode(def.additionalProperties) };
        } else if (def.additionalProperties === true && !props.length) {
            indexSignature = { keyType: 'string', value: { kind: 'plain', text: 'any' } };
        }

        return { kind: 'object', props, indexSignature };
    }

    /** Render a type known to contain no object/ref nodes, matching the legacy compact format. */
    #renderPlainTypeAsCode(node: TypeNode): string {
        switch (node.kind) {
            case 'plain':
                return node.text;
            case 'array':
                return this.#renderPlainTypeAsCode(node.item) + '[]';
            case 'tuple':
                return '[ ' + node.items.map((i) => this.#renderPlainTypeAsCode(i)).join(', ') + ' ]';
            case 'union': {
                const parts = node.options.map((o) => this.#renderPlainTypeAsCode(o));
                return parts.length > 1 ? '( ' + parts.join(' | ') + ' )' : (parts[0] ?? '');
            }
            case 'ref':
            case 'object':
                // Unreachable: callers only use this renderer when `containsComplexType` is false.
                return '';
        }
    }

    /**
     * Render a type that references a named type but involves no inline object literal, as a
     * single line of inline code with a real markdown link for each reference - the same style
     * {@link fixVSCodeRefs} uses for `#setting#`-style cross references in descriptions.
     */
    #renderLinkedType(node: TypeNode): string {
        switch (node.kind) {
            case 'plain':
                return node.text ? '`' + node.text + '`' : '';
            case 'ref':
                return '[`' + node.name + '`](' + hashRef(node.name) + ')';
            case 'array':
                return this.#renderLinkedType(node.item) + '[]';
            case 'tuple':
                return '[ ' + node.items.map((i) => this.#renderLinkedType(i)).join(', ') + ' ]';
            case 'union': {
                const parts = node.options.map((o) => this.#renderLinkedType(o));
                return parts.length > 1 ? '( ' + parts.join(' | ') + ' )' : (parts[0] ?? '');
            }
            case 'object':
                // Unreachable: callers only use this renderer when `containsObjectLiteral` is false.
                return '';
        }
    }

    /**
     * Pretty-print a type as a TypeScript type literal, the same way {@link #formatDefaultValue}
     * pretty-prints a multi-line default value into a fenced ` ```json5 ` block: plain text with
     * real indentation, meant to be placed inside a fenced ` ```ts ` block. A named-type
     * reference is rendered as its bare name (a link would not work inside a fenced code block);
     * see the "Type Definitions" section for its shape.
     */
    #renderTsType(node: TypeNode, depth: number): string {
        switch (node.kind) {
            case 'plain':
                return node.text || 'any';
            case 'ref':
                return node.name;
            case 'array':
                return this.#renderTsType(node.item, depth) + '[]';
            case 'tuple':
                return '[' + node.items.map((i) => this.#renderTsType(i, depth)).join(', ') + ']';
            case 'union': {
                const parts = node.options.map((o) => this.#renderTsType(o, depth));
                return parts.length > 1 ? '(' + parts.join(' | ') + ')' : (parts[0] ?? '');
            }
            case 'object':
                return this.#renderTsObject(node, depth);
        }
    }

    #renderTsObject(node: Extract<TypeNode, { kind: 'object' }>, depth: number): string {
        const pad = '  '.repeat(depth + 1);
        const propLines = node.props.map(
            (p) => `${pad}${propKeyText(p.key)}${p.optional ? '?' : ''}: ${this.#renderTsType(p.type, depth + 1)};`,
        );
        if (node.indexSignature) {
            propLines.push(`${pad}[key: string]: ${this.#renderTsType(node.indexSignature.value, depth + 1)};`);
        }
        if (!propLines.length) return '{}';

        return '{\n' + propLines.join('\n') + '\n' + '  '.repeat(depth) + '}';
    }

    #renderTypeNodeObjectAsTable(node: TypeNodeObject): string {
        if (!node.props.some((p) => p.description)) return '';

        const propDescription = (p: ObjectProp): string => {
            const terms = [{ term: 'Name', def: p.key }];
            if (p.description) {
                terms.push({ term: 'Description', def: p.description });
            }
            terms.push({ term: 'Type', def: this.#renderTypeFieldAsCode(p.type) });
            if (p.defaultValue) {
                terms.push({ term: 'Default', def: p.defaultValue });
            }
            if (p.since) {
                terms.push({ term: 'Since Extension Version', def: p.since });
            }

            if (p.sinceCSpellVersion) {
                terms.push({ term: 'CSpell Version', def: p.sinceCSpellVersion });
            }

            return renderMarkdownDL(terms);
        };

        const header: TableHeader = ['Fields'];
        const rows: TableRow[] = node.props.map((p) => [propDescription(p)]);
        return renderMarkdownTableHtml({ header, rows });
    }

    #formatNamedTypeDefinition(name: string, namedType: NamedType): string {
        const { node, description, title, since, sinceCSpellVersion, deprecationMessage } = namedType;
        const fmt = unindent`
            ### ${name}

            <dl>

            ${singleDef('Name', `${name}`)}

            ${singleDef('Description', description ? description + '\n' : '')}

            ${singleDef('Type', this.#renderType(node))}

            ${deprecationMessage}

            ${since ? singleDef('Since Extension Version', since) : ''}

            ${sinceCSpellVersion ? singleDef('CSpell Version', sinceCSpellVersion) : ''}

            </dl>

            ---
        `;
        return this.#fixVSCodeRefs(fmt).replace(/\n{3,}/g, '\n\n');
    }

    /** Render the "Type Definitions" section listing the named object types hoisted while formatting this section. */
    #formatNamedTypeDefinitions(): string {
        if (!this.namedTypes.size) return '';

        const sections = [...this.namedTypes.entries()].map(([name, node]) => this.#formatNamedTypeDefinition(name, node));

        return unindent`
            ## Type Definitions

            ${sections.join('\n')}
        `;
    }

    /**
     * Sort properties by name, with deprecated properties last.
     */
    #compareProperties(a: [string, JSONSchema4], b: [string, JSONSchema4]): number {
        const dA = a[1].deprecationMessage || a[1].deprecated ? 1 : 0;
        const dB = b[1].deprecationMessage || b[1].deprecated ? 1 : 0;
        return dA - dB || compare(a[0], b[0]);
    }

    #configTable(entries: [string, JSONSchema4][]): string {
        const tableEntryConfig = ([key, value]: [string, JSONSchema4]): TableRow => {
            const description = this.#fixVSCodeRefs(
                value.title || value.description?.replace(/\n/g, '<br>') || value.markdownDescription?.replace(/\n[\s\S]*/g, ' ') || '',
            );
            const scope = value.scope || '';
            return [`[\`${shorten(key, 60)}\`](${hashRef(key)})`, `${scope}`, `${shortenLine(description, descriptionWidth)}`];
        };

        return renderMarkdownTableHtml({ header: ['Setting', 'Scope', 'Description'], rows: entries.map(tableEntryConfig) });
    }

    #fixVSCodeRefs(text: string): string {
        return fixVSCodeRefs(text, this.refs);
    }

    #extractDescriptions(ref: JSONSchema4): { description: string | undefined; markdownDescription: string | undefined } {
        const resolved = this.#resolve(ref, (n) => Object.hasOwn(n, 'description') || Object.hasOwn(n, 'markdownDescription'));
        return {
            description: resolved.description,
            markdownDescription: resolved.markdownDescription,
        };
    }

    #extractCommonAttributes(def: JSONSchema4): CommonAttributes {
        const title: string = this.#getAttribute(def, 'title', '');
        const since: string = this.#getAttribute(def, 'sinceVersion', '');
        const sinceCSpellVersion: string = this.#getAttribute(def, 'since', '');
        const deprecationMessage: string = this.#getAttribute(def, 'deprecationMessage', '');
        const descriptions = this.#extractDescriptions(def);
        const description = descriptions.markdownDescription || descriptions.description || title;
        const dv = this.#getAttribute(def, 'default');
        const defaultValue = dv ? this.#formatDefaultValue(dv) : undefined;

        return { title, description, since, sinceCSpellVersion, deprecationMessage, defaultValue };
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

function hasAttribute(attribute: string): (schema: JSONSchema4) => boolean {
    return (schema: JSONSchema4): boolean => Object.hasOwn(schema, attribute);
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
    return markdown
        .replaceAll(/`#(.*?)#`/g, (_, p1) => `[\`${p1}\`](${refs[p1] || hashRef(p1)})`)
        .replaceAll(/\{@link (.*?)\}/g, (_, p1) => `\`${p1.trim()}\``);
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

/** Extracts the definition name from a `$ref` such as `#/definitions/CustomDictionaries`. */
function refName(ref: string): string {
    const path = ref.replace(/^#\//, '').split('/').map(decodeURIComponent);
    return path.slice(-1).join('');
}

/**
 * `ts-json-schema-generator` emits internal helper definitions (e.g. `Prefix<alias-...>`) used to
 * build up the config sections themselves; these are never meaningful as a named type for a
 * property's value and should always be inlined instead of hoisted.
 */
function isHoistableName(name: string): boolean {
    return !/^Prefix\b|alias-/.test(name);
}

/** True if this type is an object literal, or references/contains a named type - too complex to inline as a plain type. */
function containsComplexType(node: TypeNode): boolean {
    switch (node.kind) {
        case 'object':
        case 'ref':
            return true;
        case 'array':
            return containsComplexType(node.item);
        case 'tuple':
            return node.items.some(containsComplexType);
        case 'union':
            return node.options.some(containsComplexType);
        case 'plain':
            return false;
    }
}

/** True if this type contains an inline object literal anywhere, which must be rendered as a fenced code block. */
function containsObjectLiteral(node: TypeNode): boolean {
    switch (node.kind) {
        case 'object':
            return true;
        case 'ref':
        case 'plain':
            return false;
        case 'array':
            return containsObjectLiteral(node.item);
        case 'tuple':
            return node.items.some(containsObjectLiteral);
        case 'union':
            return node.options.some(containsObjectLiteral);
    }
}

/** True if this type references a named type anywhere, which should be rendered as a markdown link. */
function containsRef(node: TypeNode): boolean {
    switch (node.kind) {
        case 'ref':
            return true;
        case 'plain':
        case 'object':
            return false;
        case 'array':
            return containsRef(node.item);
        case 'tuple':
            return node.items.some(containsRef);
        case 'union':
            return node.options.some(containsRef);
    }
}

function dedupeTypeNodes(nodes: TypeNode[]): TypeNode[] {
    const seen = new Set<string>();
    const result: TypeNode[] = [];
    for (const node of nodes) {
        const key = JSON.stringify(node);
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(node);
    }
    return result;
}

/** Quote an object-literal property key if it isn't a valid bare identifier. */
function propKeyText(key: string): string {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
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
    const obj = JSON.parse(json);
    if (typeof obj !== 'object') return json;

    const lines: string[] = [];
    let line = '';
    let indent = '  ';

    function addToLine(...items: string[]): void {
        for (const text of items) {
            if (text === '\n') {
                lines.push(line.trimEnd());
                line = indent;
                continue;
            }
            if (line.length + text.length > width) {
                line && lines.push(line.trimEnd());
                line = indent;
            }
            line += text;
        }
    }

    const firstTry = JSON.stringify(obj, null, 2);
    if (firstTry.split('\n').length < 10) return firstTry;

    if (Array.isArray(obj)) {
        indent = '  ';
        addToLine('[', '\n');
        obj.forEach((item, index) => {
            addToLine(JSON.stringify(item) + (index === obj.length - 1 ? '' : ', '));
        });
        indent = '';
        addToLine('\n', ']');
    } else if (typeof obj === 'object') {
        indent = '  ';
        addToLine('{', '\n');
        const entries = Object.entries(obj);
        entries.forEach(([key, item], index) => {
            addToLine(JSON.stringify(key) + ': ' + (JSON.stringify(item) + (index === entries.length - 1 ? '' : ', ')));
        });
        indent = '';
        addToLine('\n', '}');
    }

    line && lines.push(line);

    // console.error('%o', lines);

    return lines.join('\n');
}

function numLines(str: string): number {
    return str.split('\n').length;
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
