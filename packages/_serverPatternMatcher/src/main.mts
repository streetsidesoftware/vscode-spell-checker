import { run } from './server.mjs';

process.on('unhandledRejection', (error) => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error);
});

process.on('uncaughtException', (error) => {
    console.log('uncaughtException', error);
});

run();
