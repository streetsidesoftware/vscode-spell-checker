import { Command } from 'commander';

import { commandUpdatePackageCSpellSchema } from './updatePackageCSpellSchema.ts';

const program = new Command();

program.addCommand(commandUpdatePackageCSpellSchema());

program.parseAsync(process.argv).catch((e) => {
    console.log(e);
});
