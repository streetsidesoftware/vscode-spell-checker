import { defaultConfigFilenames as cspellDefaultConfigFilenames } from 'cspell-lib';
import { describe, expect, test } from 'vitest';

import { defaultConfigFilenames } from './defaultConfigFilenames.mjs';

describe('defaultConfigFilenames', () => {
    test('defaultConfigFilenames', () => {
        expect(new Set(defaultConfigFilenames)).toEqual(new Set(cspellDefaultConfigFilenames));
    });
});
