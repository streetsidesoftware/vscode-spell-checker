import type { CSpellUserSettings } from '@cspell/cspell-types';
import { getSources } from 'cspell-lib';
import { Disposable } from 'vscode-languageserver/node';

import { FileWatcher } from '../utils/fileWatcher';

export class ConfigWatcher extends FileWatcher implements Disposable {
    constructor() {
        super();
    }

    processSettings(finalizedSettings: CSpellUserSettings): void {
        try {
            const sourceConfigs = getSources(finalizedSettings);

            const sources = sourceConfigs
                .filter(isDefined)
                .map((fileSettings) => fileSettings.source)
                .filter(isDefined);
            const filenames = sources.map((s) => s.filename).filter(isDefined);
            filenames.forEach((file) => this.addFile(file));
        } catch (e) {
            return;
        }
    }
}

function isDefined<T>(t: T | undefined): t is T {
    return t !== undefined;
}
