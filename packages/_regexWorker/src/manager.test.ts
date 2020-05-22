import { Manager } from './manager';
import { extractRanges } from './text';
import * as Path from 'path';

const relDir = /ts$/.test(__filename) ? '../../client/regexWorker/lib' : '.';
const libDir = Path.join(__dirname, relDir);

describe('Manager', () => {

    test('Create', () => {
        const m = new Manager(libDir);
        return expect(m.dispose()).resolves.toBe(0);
    });

    test('Echo', () => {
        const manager = new Manager(libDir);
        async function run() {
            const r = await manager.echo('hello there');
            expect(r).toBe('hello there');
        }

        return run().finally(manager.dispose);
    });

    test('EvaluateRegExp', () => {
        const manager = new Manager(libDir);
        async function run() {
            const r = await manager.evaluateRegExp(/\w+/g, sampleText());
            expect(r.elapsedTimeMs).toBeLessThan(1000);
            expect(r.ranges).toHaveLength(27);
            expect(extractRanges(sampleText(), r.ranges)).toEqual(expect.arrayContaining([
                'test', 'const', 'manager'
            ]));
        }

        return run().finally(manager.dispose);
    });

});

function sampleText() {
    return `
    test('EvaluateRegExp', () => {
        const manager = new Manager(libDir);
        async function run() {
            const r = await manager.evaluateRegExp(/\w+/g, );
            expect(r).toBe('hello there');
        }

        return run().finally(manager.dispose);
    });
`;
}
