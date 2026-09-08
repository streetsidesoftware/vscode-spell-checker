import { describe, expect, test } from 'vitest';

import { commands } from './commands.ts';

describe('commands', () => {
    test('Commands are unique', () => {
        const setOfCommands = new Set(commands.map((c) => c.command));
        expect(commands).toHaveLength(setOfCommands.size);
    });

    test('All commands start with `cSpell.`', () => {
        for (const command of commands) {
            expect(
                command.command.startsWith('cSpell.') ||
                    command.command.startsWith('cSpellRegExpTester.') ||
                    command.command === 'cspell.showActionsMenu',
                `Expect ${command.command} to start with 'cSpell.'`,
            ).toBe(true);
        }
    });
});
