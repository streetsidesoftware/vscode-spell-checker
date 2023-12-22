import { writeSync } from 'node:fs';

import { run } from './server.mjs';

process.on('unhandledRejection', (error, promise) => {
    // Will print "unhandledRejection err is not defined"
    console.log('Unhandled Rejection at:', promise, 'reason:', error);
});

process.on('uncaughtException', (error, origin) => {
    writeSync(process.stderr.fd, `Caught exception: ${error}\n` + `Exception origin: ${origin}`);
});

// process.on('uncaughtExceptionMonitor', (error, origin) => {
//     writeSync(process.stderr.fd, `Caught exception: ${error}\n` + `Exception origin: ${origin}`);
// });

run();
