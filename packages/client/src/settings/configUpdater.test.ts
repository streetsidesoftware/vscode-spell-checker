import type { CSpellUserSettings } from '../client';
import type { ConfigKeys, UpdateConfigFieldFn } from './configUpdater';
import { configUpdaterForKey } from './configUpdater';

describe('Validate configUpdater', () => {
    interface TestConfigUpdaterForKey<K extends ConfigKeys> {
        cfg: CSpellUserSettings;
        update: {
            k: K;
            f: CSpellUserSettings[K] | UpdateConfigFieldFn<K>;
        };
        expected: CSpellUserSettings;
    }

    test.each`
        cfg                                | update                            | expected
        ${{}}                              | ${{ k: 'words', f: ['a'] }}       | ${{ words: ['a'] }}
        ${{ words: ['b'], enable: false }} | ${{ k: 'words', f: () => ['a'] }} | ${{ words: ['a'] }}
    `('configUpdaterForKey $cfg', ({ cfg, update, expected }: TestConfigUpdaterForKey<ConfigKeys>) => {
        const updater = configUpdaterForKey(update.k, update.f);
        expect(updater.keys).toEqual([update.k]);
        expect(updater.updateFn(cfg)).toEqual(expected);
    });
});
