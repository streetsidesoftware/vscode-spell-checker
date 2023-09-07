import * as di from './di';

describe('Validate di', () => {
    const dependencies = di.getDependencies();

    beforeEach(di.__testing__.init);

    test('Access before initialization', () => {
        expect(() => dependencies.client).toThrow('client');
        expect(() => dependencies.dictionaryHelper).toThrow('dictionaryHelper');
        const p = Object.getOwnPropertyDescriptor(dependencies, 'name');
        expect(p?.configurable).toBe(true);
        expect(p?.writable).toBe(undefined);
        expect(p?.enumerable).toBe(true);
        expect(p?.value).toBe(undefined);
    });

    test('register', () => {
        di.register('name', () => 'register');
        const r = Object.getOwnPropertyDescriptor(dependencies, 'name');
        expect(r?.value).toBe(undefined);
        expect(r?.get).toBeTruthy();
        expect(r?.writable).toBe(undefined);
        expect(r?.enumerable).toBe(true);
        expect(dependencies.name).toBe('register');
        const p = Object.getOwnPropertyDescriptor(dependencies, 'name');
        expect(p?.value).toBe('register');
        expect(p?.writable).toBe(false);
        expect(p?.enumerable).toBe(true);
    });

    test('set', () => {
        di.set('name', 'one');
        expect(dependencies.name).toBe('one');
        expect(di.get('name')).toBe('one');
        const p = Object.getOwnPropertyDescriptor(dependencies, 'name');
        expect(p?.value).toBe('one');
        expect(p?.writable).toBe(false);
        expect(p?.enumerable).toBe(true);
    });

    test('get unknown', () => {
        expect(() => di.get(toKey('unknown'))).toThrow("Missing Dependency Resolver: 'unknown'");
    });
});

function toKey(k: string): keyof di.GlobalDependencies {
    return k as keyof di.GlobalDependencies;
}
