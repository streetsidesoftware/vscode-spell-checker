import { Evaluator } from '.';
import * as Path from 'path';

const relDir = /ts$/.test(__filename) ? '../../client/regexWorker/lib' : '.';
const libDir = Path.join(__dirname, relDir);

describe('Validate Index', () => {
    test('evaluateRegExp', async () => {
        const evaluator = new Evaluator(libDir);
        return expect(evaluator.echo('hello')).resolves.toBe('hello').finally(evaluator.dispose);
    });
});
