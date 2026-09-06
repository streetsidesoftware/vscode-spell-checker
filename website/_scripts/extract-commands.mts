import fs from 'fs/promises';
import { createRequire } from 'module';
import { unindent } from './lib/utils.mts';

interface Command {
    command: string;
    title: string;
    category?: string;
    enablement?: string;
}

interface PackageJson {
    contributes: {
        commands: Command[];
    };
}

const targetDir = new URL('../docs/', import.meta.url);

const require = createRequire(import.meta.url);

const pkgJson: PackageJson = require('../../package.json');

const commands = pkgJson.contributes.commands;

const compare = new Intl.Collator().compare;

const isCSpellCommand = /^cSpell\./;
const entries = Object.values(commands)
    .filter((cmd) => isCSpellCommand.test(cmd.command))
    .sort((a, b) => compare(a.command, b.command));

const doc = unindent`\
        ---
        # AUTO-GENERATED ALL CHANGES WILL BE LOST
        # See \`_scripts/extract-commands.mts\`
        title: Commands
        id: commands
        ---

        # Commands

        ${genCommands(entries)}

    `.replace(/\*\u200B/g, '*'); // remove zero width spaces

await fs.mkdir(targetDir, { recursive: true });
await fs.writeFile(new URL('auto_commands.md', targetDir), doc);

function genCommands(entries: Command[]): string {
    return unindent`
        | Command | Title |
        | ------- | ----- |
        ${entries.map(commandEntry).join('\n')}
    `;
}

function commandEntry(command: Command): string {
    const description = [command.title, command.enablement ? `**When:**<br />  \`${command.enablement}\`` : '']
        .filter((a) => a)
        .join('<br />');
    return `| \`${command.command}\` |  ${description} |`;
}
