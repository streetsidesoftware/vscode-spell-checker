import * as path from 'path';

export class EnvSettings {
    private rootPath: string = path.join(__dirname, '..', '..');
    private dictionaryPath: string = './dictionaries';

    get dictionaries() {
        return path.isAbsolute(this.dictionaryPath) ? this.dictionaryPath : path.join(this.rootPath, this.dictionaryPath);
    }

    set dictionaries(aPath: string) {
        this.dictionaryPath = aPath;
    }

    get root() {
        return this.rootPath;
    }

    set root(aPath: string) {
        this.rootPath = aPath;
    }

}

export const serverEnv = new EnvSettings();
