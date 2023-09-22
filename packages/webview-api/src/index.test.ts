import { describe, expect, test } from 'vitest';

import * as api from './index';

describe('api', () => {
    test('api', () => {
        expect(Object.keys(api).sort()).toMatchSnapshot();
    });
});
