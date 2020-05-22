import { parentPort, isMainThread } from 'worker_threads';
import { evaluateExpression } from './evaluateRegExp';
import {
    CommandEcho,
    CommandEvaluateRegExp,
    CommandId,
    isCommand,
    ResponseEcho,
    ResponseEvaluateRegExp,
} from './commands';

if (isMainThread) {
    console.log('main thread');
    process.exit(0);
}

let enableLogging = false;

function log(message?: any, ...rest: any[]) {
    enableLogging && console.log(message, ...rest);
}

function run() {
    parentPort?.on('message', listener);
    log('worker thread');
}

const commands: { [key in CommandId]: (v: any) => any } = {
    EvaluateRegExp: evaluateRegExp,
    Echo: echo,
}

function echo(v: CommandEcho): ResponseEcho {
    return {
        id: v.id,
        responseType: v.commandType,
        data: v.data,
    };
}

function evaluateRegExp(v: CommandEvaluateRegExp): ResponseEvaluateRegExp {
    const r = evaluateExpression(v.data.regexp, v.data.text);
    return {
        id: v.id,
        responseType: v.commandType,
        data: r,
    };
}

function post(msg: any) {
    log('Post: ' + JSON.stringify(msg));
    parentPort?.postMessage(msg);
}

function listener(v: any) {
    log(`message: ${JSON.stringify(v)}`)
    if (isCommand(v)) {
        return post(commands[v.commandType](v));
    }
    switch(v) {
        case 'enableLogging':
            enableLogging = true;
            break;
        case 'disableLogging':
            enableLogging = false;
            break;
        default:
            console.error(`Unknown message: ${JSON.stringify(v)}`);
    }
}

run();
