import { FileWatcher } from '../utils/fileWatcher';
import { CSpellUserSettings } from '@cspell/cspell-types';
import { Disposable } from 'vscode-languageserver/node';
import { getSources } from 'cspell-lib';

export class ConfigWatcher extends FileWatcher implements Disposable {
    constructor() {
        super();
    }

    processSettings(finalizedSettings: CSpellUserSettings): void {
        const sourceConfigs = getSources(finalizedSettings);

        const sources = sourceConfigs.map((fileSettings) => fileSettings.source).filter(isDefined);
        const filenames = sources.map((s) => s.filename).filter(isDefined);
        filenames.forEach((file) => this.addFile(file));
    }
}

function isDefined<T>(t: T | undefined): t is T {
    return t !== undefined;
}
