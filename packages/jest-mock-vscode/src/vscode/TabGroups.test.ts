import type { TabGroup } from 'vscode';
import { MockTabGroups } from './TabGroups';

describe('TabGroups', () => {
    test('new MockTabGroups', () => {
        const tg: TabGroup = {
            isActive: true,
            viewColumn: 1,
            activeTab: undefined,
            tabs: [],
        };
        const mtg = new MockTabGroups([tg]);
        expect(mtg.activeTabGroup).toBe(tg);
    });
});
