#!/usr/bin/env node

import { compileWordList } from './wordListCompiler';
import * as path from 'path';

const program = require('commander');

program
    .version('0.0.1');

program
    .command('compile <src...>')
    .description('compile words lists into simple dictionary files.')
    .option('-o, --output <path>', 'Specify the output directory, otherwise files are written back to the same location.')
    .option('-n, --no-compress', 'By default the files are Gzipped, this will turn that off.')
    .action((src: string[], options: { output?: string, compress: boolean }) => {
        console.log('Compile:\n output: %s\n compress: %s\n files:\n  %s \n\n',
            options.output || 'default',
            options.compress ? 'true' : 'false',
            src.join('\n  ') );

        const ext = options.compress ? '.gz' : '';

        src
            .map<[string, string]>(s => [s, options.output ? path.join(options.output, path.basename(s) + ext) : s + ext])
            .forEach(([src, dst]) => {
                console.log('Process "%s" to "%s"', src, dst);
                compileWordList(src, dst);
            });
    });

program.parse(process.argv);
