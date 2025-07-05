import type { OperatorFn } from '../Subscribables.js';
import { operate } from './operate.js';

export function map<T, U>(project: (v: T) => U): OperatorFn<T, U> {
    return (source) => operate(source, (value, emitter) => { emitter(project(value)); });
}
