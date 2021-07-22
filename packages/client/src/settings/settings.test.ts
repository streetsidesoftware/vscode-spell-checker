import { hasWorkspaceLocation } from './settings';

describe('Validate settings.ts', () => {
    test('hasWorkspaceLocation', () => {
        expect(hasWorkspaceLocation()).toBe(false);
    });
});
