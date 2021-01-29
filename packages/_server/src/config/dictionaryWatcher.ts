import { FileWatcher } from '../utils/fileWatcher';
import { CSpellUserSettings } from '@cspell/cspell-types';
import { Disposable } from 'vscode-languageserver/node';

export type Listener = (eventType?: string, filename?: string) => void;

export class DictionaryWatcher implements Disposable {
    private fileWatcher = new FileWatcher();

    readonly dispose = (): void => {
        this.clear();
        this.fileWatcher.dispose();
    };

    processSettings(finalizedSettings: CSpellUserSettings): void {
        // Only watch used dictionaries.
        const defs = new Map(finalizedSettings.dictionaryDefinitions?.map((def) => [def.name, def.path]));
        finalizedSettings.dictionaries
            ?.map((name) => defs.get(name))
            .filter((s): s is string => !!s)
            .forEach((file) => this.fileWatcher.addFile(file));
    }

    clear(): void {
        this.fileWatcher.clear();
    }

    listen(fn: Listener): Disposable {
        return this.fileWatcher.listen(fn);
    }
}
