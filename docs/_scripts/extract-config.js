/* eslint-disable @typescript-eslint/no-var-requires */

const package = require('../../package.json');

const config = package.contributes.configuration.properties;

const compare = new Intl.Collator().compare;

const entries = Object.entries(config).sort((a, b) => compare(a[0], b[0]));

const activeEntries = entries.filter(([, value]) => !value.deprecationMessage);

const doc = `---
# Note this document is automatically generated.
# See \`_scripts/extract-config.js\`
layout: default
title: Configuration Settings
categories: docs
# parent: Docs
nav_order: 4
---

<!--- AUTO-GENERATED ALL CHANGES WILL BE LOST --->

# Configuration Settings

## Settings in VS Code

${configTable(activeEntries)}

## Definitions

${configDefinitions(entries)}

`.replace(/\*\u200B/g, '*'); // remove zero width spaces

console.log(doc);

function configTable(entries) {
  return `
| Command | Description |
| ------- | ----------- |
${entries.map(tableEntry).join('\n')}
`;
}

/**
 *
 * @param {[string, any]} param0
 * @returns
 */
function tableEntry([key, value]) {
  const description =
    value.title ||
    value.description?.replace(/\n/g, '<br>') ||
    value.markdownDescription?.replace(/\n[\s\S]*/g, ' ') ||
    '';
  return `| [\`${key}\`](#${key.toLowerCase().replace(/\W/g, '')}) | ${shortenLine(description, 50)} |`;
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
  return i < line.length ? line.slice(0, i) + '...' : line;
}

function configDefinitions(entries) {
  return entries.map(definition).join('\n');
}

/**
 *
 * @param {[string, any]} entry
 * @returns
 */
function definition(entry) {
  const [key, value] = entry;
  const description = value.markdownDescription || value.description || value.title || '';
  const defaultValue = formatDefaultValue(value.default);

  const title = value.title ? `-- ${value.title}` : '';
  let name = '`' + key + '`';
  if (value.deprecationMessage) {
    name = '~~' + name + '~~';
  }

  const deprecationMessage = value.deprecationMessage
    ? `
Deprecation Message
: ${value.deprecationMessage.replace(/\n/g, '\n    ')}
`
    : '';

  return `
### ${name}

Name
: ${name} ${title.replace(/\n/g, '\n    ')}

Type
: ${formatType(value).replace(/\n/g, '\n    ')}

Description
: ${description.replace(/\n/g, '\n    ')}

${deprecationMessage}

Default
: ${defaultValue.replace(/\n/g, '\n    ')}

---
`;
}

function formatDefaultValue(value) {
  if (value === undefined) return '_- none -_';

  if (Array.isArray(value)) {
    return '[ ' + value.map(formatDefaultValue).join(', ') + ' ]';
  }

  return '_`' + JSON.stringify(value) + '`_';
}

function extractType(def) {
  if (def.type === 'array') return extractType(def.items) + '[]';

  if (def.enum) {
    return `( ${def.enum.map((v) => '`' + JSON.stringify(v) + '`').join(' \\| ')} )`;
  }

  return def.type || '';
}

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

function formatType(def) {
  const type = extractType(def);
  const enumDefs = extractEnumDescriptions(def);
  return type + enumDefs;
}
