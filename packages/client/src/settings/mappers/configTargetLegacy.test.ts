import { ConfigurationTarget } from 'vscode';

import { mapConfigTargetLegacyToClientConfigTarget } from './configTargetLegacy';

describe('configTargetLegacy', () => {
    test.each`
        target                        | expected
        ${ConfigurationTarget.Global} | ${expect.objectContaining({ kind: 'vscode', scope: 'user' })}
    `('mapConfigTargetLegacyToClientConfigTarget $target', ({ target, expected }) => {
        expect(mapConfigTargetLegacyToClientConfigTarget(target)).toEqual(expected);
    });
});
