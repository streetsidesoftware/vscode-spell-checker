/* eslint-disable @typescript-eslint/no-var-requires */

const package = require('../../package.json');

const commands = package.contributes.commands;

const compare = new Intl.Collator().compare;

const isCSpellCommand = /^cSpell\./;
const entries = Object.values(commands)
  .filter((cmd) => isCSpellCommand.test(cmd.command))
  .sort((a, b) => compare(a.command, b.command));

const doc = `
<!--- AUTO-GENERATED ALL CHANGES WILL BE LOST --->

# Commands

${genCommands(entries)}

`.replace(/\*\u200B/g, '*'); // remove zero width spaces

console.log(doc);

function genCommands(entries) {
  return `
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
  const description = [command.title, command.enablement ? `**When:**<br>  \`${command.enablement}\`` : '']
    .filter((a) => a)
    .join('<br>');
  return `| \`${command.command}\` |  ${description} |`;
}
