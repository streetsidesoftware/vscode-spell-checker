import { defaultTo, extract, map, pipe } from './pipe';

interface Address {
    street: string;
    street2?: string;
    city: string;
    postcode?: string;
    country?: string;
}

interface Person {
    name: string;
    dob?: string;
    height?: number;
    address?: Address;
    friends?: Person[];
}

interface Business {
    owner: Person;
}

describe('Validate Pipe', () => {
    const student1: Person = {
        name: 'A',
    };
    const student2: Person = {
        name: 'George',
        dob: '1980-01-01',
        address: {
            street: 'main',
            city: 'Seattle',
            postcode: '90211',
        },
        friends: [student1],
    };
    const business2: Business = {
        owner: student2,
    };
    test('pipe', () => {
        expect(pipe(student1)).toBe(student1);
        expect(pipe(student1, extract('address'), extract('postcode'), defaultTo('90210'))).toBe('90210');
        expect(pipe(student2, extract('address'), extract('postcode'), defaultTo('90210'))).toBe('90211');
    });
    test('extract', () => {
        const postcode = pipe(student2, extract('address', 'postcode'));
        expect(postcode).toBe('90211');
        expect(pipe(business2, extract('owner', 'address', 'postcode'))).toBe('90211');
        expect(pipe(business2, extract('owner', 'friends', 0, 'name'))).toBe(student1.name);
        expect(pipe(business2, extract('owner', 'friends', 1, 'name'))).toBeUndefined();
    });
    test('map', () => {
        expect(
            pipe(
                student2,
                extract('name'),
                map((s) => s.toUpperCase()),
            ),
        ).toBe(student2.name.toUpperCase());
        expect(
            pipe(
                student1,
                extract('dob'),
                map((s) => s.toUpperCase()),
            ),
        ).toBeUndefined();
    });
});
