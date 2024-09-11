import fs from 'fs/promises';
import { createRequire } from 'module';
import { unindent } from './lib/utils.mjs';

const targetDir = new URL('../docs/', import.meta.url);

const require = createRequire(import.meta.url);

const pkgJson = require('../../package.json');

const commands = pkgJson.contributes.commands;

const compare = new Intl.Collator().compare;

const isCSpellCommand = /^cSpell\./;
const entries = Object.values(commands)
    .filter((cmd) => isCSpellCommand.test(cmd.command))
    .sort((a, b) => compare(a.command, b.command));

const doc = unindent`\
        ---
        # AUTO-GENERATED ALL CHANGES WILL BE LOST
        # See \`_scripts/extract-commands.js\`
        title: Commands
        id: commands
        ---

        # Commands

        ${genCommands(entries)}

    `.replace(/\*\u200B/g, '*'); // remove zero width spaces

await fs.mkdir(targetDir, { recursive: true });
await fs.writeFile(new URL('auto_commands.md', targetDir), doc);

function genCommands(entries) {
    return unindent`
        | Command | Title |
        | ------- | ----- |
        ${entries.map(commandEntry).join('\n')}
    `;
}

/**
 *
 * @param {[string, any]} param0
 * @returns
 */
function commandEntry(command) {
    const description = [command.title, command.enablement ? `**When:**<br />  \`${command.enablement}\`` : '']
        .filter((a) => a)
        .join('<br />');
    return `| \`${command.command}\` |  ${description} |`;
}
