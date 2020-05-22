import { EvalRegExpResult } from './evaluateRegExp';

export const CommandNames = {
    Echo: 'Echo',
    EvaluateRegExp: 'EvaluateRegExp',
};

export type CommandId = keyof typeof CommandNames;

export interface Command {
    id: number;
    commandType: CommandId;
    data: any;
}

export interface Response {
    id: number;
    responseType: CommandId;
    data: any;
}

export interface CommandEcho extends Command {
    commandType: 'Echo';
    data: string;
}

export interface ResponseEcho extends Response {
    responseType: 'Echo';
    data: string;
}

export const isEchoCommand = genIsCommand<CommandEcho>('Echo');

export interface CommandEvaluateRegExp extends Command {
    commandType: 'EvaluateRegExp';
    data: {
        text: string;
        regexp: RegExp | string;
    };
}

export interface ResponseEvaluateRegExp extends Response {
    responseType: 'EvaluateRegExp';
    data: EvalRegExpResult;
}

export const isEvaluateRegExpCommand = genIsCommand<CommandEvaluateRegExp>('EvaluateRegExp');
export const isEvaluateRegExpResponse = genIsResponse<ResponseEvaluateRegExp>('EvaluateRegExp')


function genIsCommand<T extends Command>(key: T['commandType']): (v: any) => v is T {
    return  (v: any): v is T => {
        return isCommand(v) && v.commandType === key;
    }
}

export function isCommand(v: any): v is Command {
    return !!(typeof v === 'object' && CommandNames[(v as Command).commandType] && (typeof v.id === 'number'));
}

function genIsResponse<T extends Response>(key: T['responseType']): (v: any) => v is T {
    return  (v: any): v is T => {
        return isResponse(v) && v.responseType === key;
    }
}

export function isResponse(v: any): v is Response {
    return !!(typeof v === 'object' && CommandNames[(v as Response).responseType] && (typeof v.id === 'number'));
}
