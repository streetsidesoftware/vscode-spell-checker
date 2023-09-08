import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import Mocha from 'mocha';

export async function run(): Promise<void> {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'bdd',
        color: true,
    });

    const testsRoot = fileURLToPath(new URL('.', import.meta.url));

    const files = await glob('**/**.test.?(c)js', { cwd: testsRoot });

    console.log('files: %o', files);

    // Add files to the test suite
    files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

    return new Promise((resolve, reject) => {
        // Run the mocha test
        mocha.run((failures) => {
            if (failures > 0) {
                reject(Error(`${failures} tests failed.`));
            } else {
                resolve();
            }
        });
    });
}
