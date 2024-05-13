import type { CSpellUserSettings } from 'cspell-lib';

export { ConfigFields as CSpellConfigFields } from '@cspell/cspell-types';
export { ConfigFields } from 'code-spell-checker-server/lib';

export type ConfigKeys = Exclude<
    keyof CSpellUserSettings,
    '$schema' | 'version' | 'id' | 'experimental.enableRegexpView' | 'experimental.enableSettingsViewerV2'
>;
