import { describe, expect, test, vi } from 'vitest';
import { EventEmitter } from 'vscode';

import { assert, createEmitter, isEventEmitter } from './createEmitter.mjs';

vi.mock('vscode');

describe('createEmitter', () => {
    test('createEmitter', () => {
        const emitter = createEmitter();
        expect(emitter).toBeDefined();
        expect(emitter.isDisposed).toBe(false);
        expect(emitter.dispose).toBeTypeOf('function');
        expect(isEventEmitter(emitter)).toBe(true);
    });

    test('createEmitter fire/event', () => {
        const listener = vi.fn();
        const listener2 = vi.fn();
        const emitter = createEmitter();
        const disposable = emitter.event(listener);
        emitter.fire('test');
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenLastCalledWith('test');

        emitter.fire('test2');
        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith('test2');

        disposable.dispose();

        emitter.fire('test3');
        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith('test2');

        emitter.event(listener);
        emitter.event(listener2);

        emitter.fire('test4');
        expect(listener).toHaveBeenCalledTimes(3);
        expect(listener).toHaveBeenLastCalledWith('test4');

        expect(listener2).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenLastCalledWith('test4');

        emitter.dispose();
        expect(emitter.isDisposed).toBe(true);
    });

    test('createEmitter dispose', () => {
        const listener = vi.fn();
        const emitter = createEmitter();
        const disposable = emitter.event(listener);

        emitter.fire('test');
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenLastCalledWith('test');

        emitter.dispose();

        expect(emitter.isDisposed).toBe(true);
        expect(() => emitter.fire('test2')).not.toThrowError();
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenLastCalledWith('test');

        expect(() => disposable.dispose()).not.toThrowError();

        expect(() => emitter.event(listener)).toThrowError('EventEmitter is disposed');
    });

    test('createEmitter listeners can only be added once.', () => {
        const listener = vi.fn();
        const emitter = createEmitter();
        const disposable = emitter.event(listener);
        const disposable2 = emitter.event(listener);
        emitter.fire('test');
        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith('test');

        disposable2.dispose();

        emitter.fire('test2');
        expect(listener).toHaveBeenCalledTimes(3);
        expect(listener).toHaveBeenLastCalledWith('test2');

        disposable.dispose();

        emitter.fire('test3');
        expect(listener).toHaveBeenCalledTimes(3);
        expect(listener).toHaveBeenLastCalledWith('test2');
    });

    test('listeners that throw', () => {
        const listener = vi.fn();
        const faultyListener = vi.fn(() => {
            throw new Error('Boom');
        });
        const emitter = createEmitter();
        const disposable = emitter.event(faultyListener);
        const disposable2 = emitter.event(listener);

        emitter.fire('test');
        expect(faultyListener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledTimes(1);

        emitter.fire('test2');
        expect(faultyListener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenCalledTimes(2);

        disposable.dispose();

        emitter.fire('test3');
        expect(faultyListener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenCalledTimes(3);

        disposable2.dispose();
    });

    test('isEmitter', () => {
        expect(isEventEmitter(createEmitter())).toBe(true);
        expect(isEventEmitter({})).toBe(false);
        expect(isEventEmitter({ event: () => ({ dispose: () => {} }), fire: () => {}, dispose: () => {} })).toBe(true);
        expect(isEventEmitter(new EventEmitter())).toBe(true);
    });

    test('assert', () => {
        expect(assert(true)).toBeUndefined();
        expect(() => assert(false)).toThrowError('assertion failed');
        expect(() => assert(false, 'Value Required')).toThrowError('Value Required');
    });
});
