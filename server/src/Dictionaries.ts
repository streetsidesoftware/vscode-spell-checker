import { DictionaryDefinition } from './CSpellSettingsDef';
import * as path from 'path';


const extensionPath = path.join(__dirname, '..', '..');
const dictionaryPath = path.join(extensionPath, 'dictionaries');

export const defaultDictionaryFiles: DictionaryDefinition[] = [
    { name: 'wordsEn',        file: 'wordsEn.txt',          type: 'S' },
    { name: 'typescript',     file: 'typescript.txt',       type: 'C' },
    { name: 'node',           file: 'node.txt',             type: 'C' },
    { name: 'softwareTerms',  file: 'softwareTerms.txt',    type: 'W' },
    { name: 'html',           file: 'html.txt',             type: 'S' },
    { name: 'php',            file: 'php.txt',              type: 'C' },
    { name: 'go',             file: 'go.txt',               type: 'C' },
    { name: 'companies',      file: 'companies.txt',        type: 'C' },
    { name: 'python',         file: 'python.txt',           type: 'C' },
    { name: 'fonts',          file: 'fonts.txt',            type: 'C' },
    { name: 'css',            file: 'css.txt',              type: 'S' },
];


