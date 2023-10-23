import type { OperatorFn } from '../Subscribables';
import { operate } from './operate';

export function map<T, U>(project: (v: T) => U): OperatorFn<T, U> {
    return (source) => operate(source, (value, emitter) => emitter(project(value)));
}
