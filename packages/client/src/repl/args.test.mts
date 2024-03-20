import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';

import { describe, expect, test } from 'vitest';

import { Application, Command } from './args.mjs';
import { removeLeftPad } from './textUtils.mjs';

const ac = expect.arrayContaining;

const tokens = ac([]);

const r = removeLeftPad;

describe('parseArgs', () => {
    test.each`
        args                                                         | expected
        ${['-abc', 'hello', 'there']}                                | ${{ positionals: ['hello', 'there'], values: { apple: true, banana: true, cherry: true }, tokens }}
        ${['--fruit', 'apple', 'banana', '--', 'hello', 'there']}    | ${{ positionals: ['banana', 'hello', 'there'], values: { fruit: ['apple'] }, tokens }}
        ${['-f', 'apple', '--fruit=banana', '--', 'hello', 'there']} | ${{ positionals: ['hello', 'there'], values: { fruit: ['apple', 'banana'] }, tokens }}
        ${['-f=apple', '--fruit=banana', '--']}                      | ${{ positionals: [], values: { fruit: ['=apple', 'banana'] }, tokens }}
        ${['-abC7', 'hello', 'there']}                               | ${{ positionals: ['hello', 'there'], values: { apple: true, banana: true, code: '7' }, tokens }}
        ${['-C7', '-C8']}                                            | ${{ positionals: [], values: { code: '8' }, tokens }}
    `('pareArgs $args', ({ args, expected }) => {
        const options: ParseArgsConfig['options'] = {
            apple: { type: 'boolean', short: 'a' },
            banana: { type: 'boolean', short: 'b' },
            cherry: { type: 'boolean', short: 'c' },
            code: { type: 'string', short: 'C' },
            fruit: { type: 'string', short: 'f', multiple: true },
        };
        const result = parseArgs({ args, options, allowPositionals: true, tokens: true });
        // console.log('%o', result);
        expect(result).toEqual(expected);
    });
});

describe('Application', () => {
    const cmdFoo = new Command(
        'foo',
        'Display some foo.',
        {
            count: { type: 'number', required: true, description: 'Amount of foo to display' },
            names: { type: 'string[]', description: 'Optional names to display.' },
        },
        {
            verbose: { type: 'boolean', short: 'v', description: 'Show extra details' },
            upper: { type: 'boolean', short: 'u', description: 'Show in uppercase' },
        },
    );

    const cmdBar = new Command(
        'bar',
        'Make blocking statements.',
        {
            message: { type: 'string', required: true, description: 'The message to display' },
        },
        {
            loud: { type: 'boolean', short: 'l', description: 'Make it loud' },
        },
    );

    const cmdHelp = new Command(
        'help',
        'Display Help',
        {
            command: { type: 'string', description: 'Show Help for command.' },
        },
        {},
    );

    const cmdComplex = new Command(
        'complex',
        r(`\
            This is a command with unnecessary complexity and options.
            Even the description is long and verbose. with a lot of words and new lines.
              - one: Argument one.
              - two: Argument two.
        `),
        {
            one: { type: 'string', required: true, description: 'Argument one.' },
            two: { type: 'string', required: true, description: 'Argument two.' },
            many: { type: 'string[]', description: 'The rest of the arguments.' },
        },
        {
            verbose: { type: 'boolean', short: 'v', description: 'Show extra details' },
            upper: { type: 'boolean', short: 'u', description: 'Show in uppercase' },
            lower: { type: 'boolean', short: 'l', description: 'Show in lowercase' },
            'pad-left': { type: 'number', description: 'Pad the left side' },
            'pad-right': { type: 'number', description: 'Pad the right side' },
        },
    );

    test('Application Help', () => {
        const commands = [cmdFoo, cmdBar, cmdComplex, cmdHelp];
        const app = new Application('test', 'Test Application.').addCommands(commands);
        expect(app.getHelp()).toBe(
            r(`\
            test

            Test Application.

            Commands:
              foo <count> [names...]         Display some foo.
              bar <message>                  Make blocking statements.
              complex <one> <two> [many...]  This is a command with unnecessary complexity
                                             and options.
                                             Even the description is long and verbose. with
                                             a lot of words and new lines.
                                               - one: Argument one.
                                               - two: Argument two.
              help [command]                 Display Help`),
        );
    });

    test('Command Help', () => {
        const commands = [cmdFoo, cmdBar, cmdComplex, cmdHelp];
        const app = new Application('test', 'Test Application.').addCommands(commands);

        expect(app.getHelp('foo')).toBe(
            r(`\
            Usage: foo [options] <count> [names...]

            Display some foo.

            Arguments:
              <count>     Amount of foo to display
              [names...]  Optional names to display.

            Options:
              -v, --verbose  Show extra details
              -u, --upper    Show in uppercase`),
        );

        expect(app.getHelp('bar')).toBe(
            r(`\
            Usage: bar [options] <message>

            Make blocking statements.

            Arguments:
              <message>  The message to display

            Options:
              -l, --loud  Make it loud`),
        );

        expect(app.getHelp('help')).toBe(
            r(`\
            Usage: help [command]

            Display Help

            Arguments:
              [command]  Show Help for command.`),
        );
    });
});
