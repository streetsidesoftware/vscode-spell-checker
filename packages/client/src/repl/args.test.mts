import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';

import createOptionParser from 'optionator';
import { describe, expect, test, vi } from 'vitest';
import { EventEmitter } from 'vscode';

import { Application, Command } from './args.mjs';
import { emitterToWriteStream } from './emitterToWriteStream.mjs';
import { unindent } from './textUtils.mjs';

vi.mock('vscode');

const ac = expect.arrayContaining;

const tokens = ac([]);

const T = true;

const r = unindent;

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
});

// cspell:words optionator

describe('optionator', () => {
    const config1: createOptionParser.IOptionatorArgs = {
        prepend: 'Usage: test [options] <source> [target]',
        append: 'Version 1.0.0',
        options: [
            { heading: 'Options' },
            { option: 'verbose', alias: 'v', type: 'Boolean', description: 'Show extra details' },
            { option: 'upper', alias: 'u', type: 'Boolean', description: 'Show in uppercase' },
            { option: 'lower', alias: 'l', type: 'Boolean', description: 'Show in lowercase' },
            { option: 'pad-left', type: 'Number', description: 'Pad the left side', default: '0' },
            { option: 'pad-right', type: 'Number', description: 'Pad the right side', default: '0' },
            { option: 'help', alias: 'h', type: 'Boolean', description: 'Show help' },
        ],
        positionalAnywhere: true,
    };

    test('generateHelp', () => {
        const emitter = new EventEmitter<string>();
        const outputFn = vi.fn();
        emitter.event(outputFn);
        const stdout = emitterToWriteStream(emitter);
        const optionator = createOptionParser({ ...config1, stdout });

        expect(optionator.generateHelp()).toBe(
            unindent(`\
        Usage: test [options] <source> [target]

        Options:
          -v, --verbose       Show extra details
          -u, --upper         Show in uppercase
          -l, --lower         Show in lowercase
          --pad-left Number   Pad the left side - default: 0
          --pad-right Number  Pad the right side - default: 0
          -h, --help          Show help

        Version 1.0.0`),
        );

        expect(outputFn).not.toHaveBeenCalled();
    });

    test.each`
        args                                | expected
        ${['-v', '--pad-left', '3', 'foo']} | ${{ _: ['foo'], verbose: true, padLeft: 3, padRight: 0 }}
        ${'one two three'}                  | ${{ _: ['one', 'two', 'three'], padLeft: 0, padRight: 0 }}
        ${'show --no-upper'}                | ${{ _: ['show'], padLeft: 0, padRight: 0, upper: false }}
        ${'show --upper=false'}             | ${{ _: ['show'], padLeft: 0, padRight: 0, upper: false }}
        ${'show -u -- again'}               | ${{ _: ['show', 'again'], padLeft: 0, padRight: 0, upper: true }}
        ${'show -u -- again'.split(' ')}    | ${{ _: ['show', 'again'], padLeft: 0, padRight: 0, upper: true }}
    `('parse $args', ({ args, expected }) => {
        const emitter = new EventEmitter<string>();
        const outputFn = vi.fn();
        emitter.event(outputFn);
        const stdout = emitterToWriteStream(emitter);
        const optionator = createOptionParser({ ...config1, stdout });

        const result = optionator.parse(args, { slice: 0 });
        expect(result).toEqual(expected);
        expect(outputFn).not.toHaveBeenCalled();
    });

    test.each`
        args           | expected
        ${'--no-show'} | ${"Invalid option '--show' - perhaps you meant '-h'?"}
    `('parse fail $args', ({ args, expected }) => {
        const emitter = new EventEmitter<string>();
        const outputFn = vi.fn();
        emitter.event(outputFn);
        const stdout = emitterToWriteStream(emitter);
        const optionator = createOptionParser({ ...config1, stdout });

        expect(() => optionator.parse(args, { slice: 0 })).toThrow(expected);
        expect(outputFn).not.toHaveBeenCalled();
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
