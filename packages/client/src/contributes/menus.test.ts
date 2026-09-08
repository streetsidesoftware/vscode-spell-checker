import { describe, expect, test } from 'vitest';

import { commands } from './commands.ts';
import { menus, submenus } from './menus.ts';

describe('menus', () => {
    const setOfCommands = new Set(commands.map((c) => c.command));

    test('All menu commands exist', () => {
        for (const menu of Object.values(menus)) {
            for (const item of menu) {
                if ('command' in item) {
                    expect(setOfCommands.has(item.command)).toBe(true);
                }
            }
        }
    });

    test('All submenu menu items exist', () => {
        const setOfSubmenuIds = new Set(submenus.map((s) => s.id));

        for (const menu of Object.values(menus)) {
            for (const item of menu) {
                if ('submenu' in item) {
                    expect(setOfSubmenuIds.has(item.submenu), `Expected submenu with id '${item.submenu}' to exist`).toBe(true);
                    expect(menus[item.submenu], `Expected submenu with id '${item.submenu}' to exist in menus`).toBeDefined();
                }
            }
        }
    });

    test('All submenu entries exist in menus', () => {
        for (const submenu of submenus) {
            expect(menus[submenu.id], `Expected submenu with id '${submenu.id}' to exist in menus`).toBeDefined();
        }
    });
});
