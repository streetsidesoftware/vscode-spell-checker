import { isErrnoException } from './errors';

describe('errors', () => {
    const ex1: NodeJS.ErrnoException = {
        name: 'name',
        message: 'message',
        get code() {
            return 'CODE';
        },
    };

    test.each`
        err                        | expected
        ${{}}                      | ${false}
        ${ex1}                     | ${true}
        ${{ ...ex1, errno: '42' }} | ${false}
    `('isErrnoException $err', ({ err, expected }) => {
        expect(isErrnoException(err)).toBe(expected);
    });
});
