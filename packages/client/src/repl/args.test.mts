import assert from 'node:assert';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';

import { describe, expect, test } from 'vitest';

import { Application, castValueToType, Command, toBoolean } from './args.mjs';
import { parseCommandLineIntoArgs } from './parseCommandLine.js';
import { unindent } from './textUtils.mjs';

const ac = expect.arrayContaining;

const tokens = ac([]);

const T = true;

const r = unindent;

/*
 * Test our parseArgs assumptions.
 */
describe('parseArgs', () => {
    test.each`
        args                                                         | expected
        ${['-abc', 'hello', 'there']}                                | ${{ positionals: ['hello', 'there'], values: { apple: true, banana: true, cherry: true }, tokens }}
        ${['--fruit', 'apple', 'banana', '--', 'hello', 'there']}    | ${{ positionals: ['banana', 'hello', 'there'], values: { fruit: ['apple'] }, tokens }}
        ${['-f', 'apple', '--fruit=banana', '--', 'hello', 'there']} | ${{ positionals: ['hello', 'there'], values: { fruit: ['apple', 'banana'] }, tokens }}
        ${['-f=apple', '--fruit=banana', '--']}                      | ${{ positionals: [], values: { fruit: ['=apple', 'banana'] }, tokens }}
        ${['-abC7', 'hello', 'there']}                               | ${{ positionals: ['hello', 'there'], values: { apple: true, banana: true, code: '7' }, tokens }}
        ${['-C7', '-C8']}                                            | ${{ positionals: [], values: { code: '8' }, tokens }}
        ${['-a', 'red', '-C', '8', '-vvv', '--verbose']}             | ${{ positionals: ['red'], values: { apple: true, code: '8', verbose: [T, T, T, T] }, tokens }}
    `('pareArgs $args', ({ args, expected }) => {
        const options: ParseArgsConfig['options'] = {
            apple: { type: 'boolean', short: 'a' },
            banana: { type: 'boolean', short: 'b' },
            cherry: { type: 'boolean', short: 'c' },
            code: { type: 'string', short: 'C' },
            verbose: { type: 'boolean', short: 'v', multiple: true },
            fruit: { type: 'string', short: 'f', multiple: true },
        };
        const result = parseArgs({ args, options, allowPositionals: true, tokens: true });
        // console.log('%o', result);
        expect(result).toEqual(expected);
    });

    // cspell:ignore alse
    test.each`
        args                                                                | expected
        ${['-a', 'red', '-C', '8', '-vvv', '--verbose', '--verbose=false']} | ${{ positionals: ['red'], values: { apple: true, code: '8', verbose: [T, T, T, T, 'false'] }, tokens }}
        ${['-a', 'red', '-C', '8', '-vvv', '--verbose', '-v=false']}        | ${{ positionals: ['red'], values: { apple: true, code: '8', fruit: ['alse'], verbose: [T, T, T, T, T], '=': T }, tokens }}
    `('pareArgs $args', ({ args, expected }) => {
        const options: ParseArgsConfig['options'] = {
            apple: { type: 'boolean', short: 'a' },
            banana: { type: 'boolean', short: 'b' },
            cherry: { type: 'boolean', short: 'c' },
            code: { type: 'string', short: 'C' },
            verbose: { type: 'boolean', short: 'v', multiple: true },
            fruit: { type: 'string', short: 'f', multiple: true },
        };
        const result = parseArgs({ args, options, allowPositionals: true, tokens: true, strict: false });
        console.log('%o', result);
        expect(result).toEqual(expected);
    });
});

describe('Application', () => {
    const anyArgs = ac([]);
    const cmdFoo = new Command(
        'foo',
        'Display some foo.',
        {
            count: { type: 'string', required: true, description: 'Amount of foo to display' },
            names: { type: 'string[]', description: 'Optional names to display.' },
        },
        {
            verbose: { type: 'boolean', short: 'v', description: 'Show extra details' },
            upper: { type: 'boolean', short: 'u', description: 'Show in uppercase' },
            repeat: { type: 'number', short: 'r', description: 'Repeat the message' },
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
            verbose: { type: 'boolean[]', short: 'v', description: 'Show extra details' },
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

    test.each`
        cmd                                    | expected
        ${'bar hello --loud'}                  | ${{ argv: anyArgs, args: { _: ['hello'], message: 'hello' }, options: { loud: true } }}
        ${'bar  -l none'}                      | ${{ argv: anyArgs, args: { _: ['none'], message: 'none' }, options: { loud: true } }}
        ${'foo 5 one two -r 2'}                | ${{ argv: anyArgs, args: { _: ['5', 'one', 'two'], count: '5', names: ['one', 'two'] }, options: { repeat: 2 } }}
        ${'foo 5 one two -r 2 -r7'}            | ${{ argv: anyArgs, args: { _: ['5', 'one', 'two'], count: '5', names: ['one', 'two'] }, options: { repeat: 7 } }}
        ${'foo 42 --repeat=7'}                 | ${{ argv: anyArgs, args: { _: ['42'], count: '42' }, options: { repeat: 7 } }}
        ${'complex a b c d -v -v -v -v'}       | ${{ argv: anyArgs, args: { _: [...'abcd'], one: 'a', two: 'b', many: ['c', 'd'] }, options: { verbose: [T, T, T, T] } }}
        ${'complex a b c d'}                   | ${{ argv: anyArgs, args: { _: [...'abcd'], one: 'a', two: 'b', many: ['c', 'd'] }, options: {} }}
        ${'complex a b c --verbose=false d'}   | ${{ argv: anyArgs, args: { _: [...'abcd'], one: 'a', two: 'b', many: ['c', 'd'] }, options: { verbose: [false] } }}
        ${'complex a b c --no-verbose d'}      | ${{ argv: anyArgs, args: { _: [...'abcd'], one: 'a', two: 'b', many: ['c', 'd'] }, options: { verbose: [false] } }}
        ${'complex a b c --no-verbose=true d'} | ${{ argv: anyArgs, args: { _: [...'abcd'], one: 'a', two: 'b', many: ['c', 'd'] }, options: { verbose: [false] } }}
    `('Parse Command $cmd', ({ cmd: commandLine, expected }) => {
        const commands = [cmdFoo, cmdBar, cmdComplex, cmdHelp];
        const app = new Application('test', 'Test Application.').addCommands(commands);
        const argv = parseCommandLineIntoArgs(commandLine);
        const command = app.getCommand(argv[0]);
        assert(command);
        const args = command.parse(argv);
        expect(args).toEqual(expected);
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
              -v, --verbose          Show extra details
              -u, --upper            Show in uppercase
              -r, --repeat <repeat>  Repeat the message`),
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

        expect(app.getHelp('complex')).toBe(
            r(`\
            Usage: complex [options] <one> <two> [many...]

            This is a command with unnecessary complexity and options.
            Even the description is long and verbose. with a lot of words and new lines.
              - one: Argument one.
              - two: Argument two.


            Arguments:
              <one>      Argument one.
              <two>      Argument two.
              [many...]  The rest of the arguments.

            Options:
              -v, --verbose            Show extra details
              -u, --upper              Show in uppercase
              -l, --lower              Show in lowercase
              --pad-left <pad-left>    Pad the left side
              --pad-right <pad-right>  Pad the right side`),
        );
    });
});

describe('conversions', () => {
    test.each`
        value        | expected
        ${true}      | ${true}
        ${false}     | ${false}
        ${1}         | ${true}
        ${0}         | ${false}
        ${NaN}       | ${false}
        ${'True'}    | ${true}
        ${'False'}   | ${false}
        ${'T'}       | ${true}
        ${'F'}       | ${false}
        ${'1'}       | ${true}
        ${'0'}       | ${false}
        ${'yes'}     | ${true}
        ${'no'}      | ${false}
        ${undefined} | ${undefined}
    `('toBoolean $value', ({ value, expected }) => {
        expect(toBoolean(value)).toBe(expected);
    });

    test.each`
        value      | expected
        ${'sunny'} | ${'Invalid boolean value: sunny'}
    `('toBoolean $value with error', ({ value, expected }) => {
        expect(() => toBoolean(value)).toThrow(expected);
    });

    test.each`
        value         | optType      | expected
        ${true}       | ${'boolean'} | ${true}
        ${true}       | ${'string'}  | ${'true'}
        ${42}         | ${'string'}  | ${'42'}
        ${{ a: 'b' }} | ${'string'}  | ${'[object Object]'}
        ${NaN}        | ${'string'}  | ${'NaN'}
        ${true}       | ${'number'}  | ${1}
        ${42}         | ${'number'}  | ${42}
        ${'42'}       | ${'number'}  | ${42}
        ${'0x10'}     | ${'number'}  | ${16}
        ${'010'}      | ${'number'}  | ${10}
    `('castValueToType $value $optType', ({ value, optType, expected }) => {
        expect(castValueToType(value, optType)).toBe(expected);
    });

    test.each`
        value    | optType      | expected
        ${'42b'} | ${'number'}  | ${'Invalid number value: 42b'}
        ${'42b'} | ${'boolean'} | ${'Invalid boolean value: 42b'}
        ${{}}    | ${'boolean'} | ${'Invalid boolean value: [object Object]'}
    `('castValueToType $value $optType to error', ({ value, optType, expected }) => {
        expect(() => castValueToType(value, optType)).toThrow(expected);
    });
});
