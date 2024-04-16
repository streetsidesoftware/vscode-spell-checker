import { describe, expect, test, vi } from 'vitest';
import { ConfigurationTarget } from 'vscode';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

import { mapConfigTargetLegacyToClientConfigTarget } from './configTargetLegacy.mjs';

describe('configTargetLegacy', () => {
    test.each`
        target                        | expected
        ${ConfigurationTarget.Global} | ${expect.objectContaining({ kind: 'vscode', scope: 'user' })}
    `('mapConfigTargetLegacyToClientConfigTarget $target', ({ target, expected }) => {
        expect(mapConfigTargetLegacyToClientConfigTarget(target)).toEqual(expected);
    });
});
